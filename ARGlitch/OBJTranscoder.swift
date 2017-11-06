//
//  OBJTranscoder.swift
//  ARGlitch
//
//  Created by Nate Parrott on 11/6/17.
//  Copyright © 2017 Nate Parrott. All rights reserved.
//

import Foundation
import ZIPFoundation
import Firebase
import FirebaseStorage

// https://vr.google.com/downloads/8kSHCCK66fa/20grUA7hT5I/8kSHCCK66fa_20grUA7hT5I_obj.zip
// http://localhost:8000/test_obj.zip

class OBJTranscoderSession {
    init(zipUrl: URL) {
        self.zipUrl = zipUrl
    }
    
    let zipUrl: URL
    let maxSize: Int64 = 10 * 1024 * 1024 // 10 mb
    var tempLocalZipUrl: URL?
    
    func start(callback: @escaping (Result) -> ()) {
        // callback can come on any thread
        checkSize { (sizeOpt) in
            if let size = sizeOpt {
                if size <= self.maxSize {
                    self.getData() { (dataOpt) in
                        if let data = dataOpt {
                            guard let localUrl = self.writeZipFileToDisk(data) else {
                                callback(.failure("Unable to write zip to disk"))
                                return
                            }
                            self.tempLocalZipUrl = localUrl // TODO: clean up later
                            if let archive = Archive(url: localUrl, accessMode: .read) {
                                self.upload(archive: archive, callback: callback)
                            } else {
                                callback(.failure("Unable to open Zip file"))
                            }
                        } else {
                            callback(.failure("Failed to download"))
                        }
                    }
                } else {
                    callback(.fileTooBig)
                }
            } else {
                callback(.failure("HEAD request failed"))
            }
        }
    }
    
    private func upload(archive: Archive, callback: @escaping (Result) -> ()) {
        guard let objEntry = archive.filter({ $0.path.hasSuffix(".obj") }).first else {
            callback(.failure("No obj file"))
            return
        }
        // TODO: do we need to enforce presence of an MTL file?
        guard let mtlEntry = archive.filter({ $0.path.hasSuffix(".mtl") }).first else {
            callback(.failure("No mtl file"))
            return
        }
        let shouldUploadPath = { (path: String) -> Bool in
            return path.hasSuffix(".png") || path.hasSuffix(".gif")
        }
        let toUpload = Array(archive.filter({ shouldUploadPath($0.path) }))
        for entry in archive {
            if entry == objEntry {
                print("OBJ: \(entry.path)")
            } else if entry == mtlEntry {
                print("MTL: \(entry.path)")
            } else if toUpload.contains(entry) {
                print("Image: \(entry.path)")
            } else {
                print("Skipping: \(entry.path)")
            }
        }
        
        let storage = Storage.storage()
        
        let modelId = UUID().uuidString
        let modelRef = storage.reference(withPath: "models").child(modelId)
        let entryPathPairs = [("model.obj", objEntry), ("model.mtl", mtlEntry)] + toUpload.map({ ($0.path, $0) })
        uploadAllAndGetUrls(pairs: entryPathPairs, archive: archive, modelRef: modelRef) { (downloadUrlsOpt) in
            if let downloadUrls = downloadUrlsOpt {
                print("download urls: \(downloadUrls)")
                let objUrl = downloadUrls["model.obj"]!
                let mtlUrl = downloadUrls["model.mtl"]!
                callback(.success(objUrl: objUrl, mtlUrl: mtlUrl))
            } else {
                callback(.failure("Upload failed"))
            }
        }
    }
    
    private func getData(callback: @escaping (Data?) -> ()) {
        let task = URLSession.shared.dataTask(with: zipUrl) { (dataOpt, _, _) in
            callback(dataOpt)
        }
        task.resume()
    }
    
    private func checkSize(callback: @escaping (Int64?) -> ()) {
        var req = URLRequest(url: zipUrl)
        req.httpMethod = "HEAD"
        let task = URLSession.shared.dataTask(with: req) { (_, responseOpt, _) in
            callback(responseOpt?.expectedContentLength)
        }
        task.resume()
    }
    
    enum Result {
        case failure(String?)
        case fileTooBig
        case success(objUrl: URL, mtlUrl: URL?)
    }
    
    // MARK: Helpers
    func writeZipFileToDisk(_ data: Data) -> URL? {
        let url = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent(UUID().uuidString + ".zip")
        do {
            try data.write(to: url)
            return url
        } catch {
            return nil
        }
    }
    
    func upload(ref: StorageReference, data: Data, callback: @escaping (URL?) -> ()) {
        print(" uploading data to \(ref)")
        ref.putData(data, metadata: nil) { (metadataOpt: StorageMetadata?, _) in
            if let dl = metadataOpt?.downloadURL() {
                print("  download url: \(dl)")
            } else {
                print("  download failed")
            }
            callback(metadataOpt?.downloadURL())
        }
    }
    
    func uploadAllAndGetUrls(pairs: [(String, Archive.Element)], archive: Archive, modelRef: StorageReference, callback: @escaping ([String: URL]?) -> ()) {
        if let (path, archiveEntry) = pairs.first {
            archive.extractData(from: archiveEntry, callback: { (dataOpt) in
                guard let data = dataOpt else {
                    print("failed to extract data")
                    return
                }
                let childRef = modelRef.child(path)
                self.upload(ref: childRef, data: data, callback: { (downloadUrlOpt) in
                    if let downloadUrl = downloadUrlOpt {
                        let remainingPairs = Array(pairs.dropFirst())
                        self.uploadAllAndGetUrls(pairs: remainingPairs, archive: archive, modelRef: modelRef, callback: { (downloadUrlsOpt) in
                            if var downloadUrls = downloadUrlsOpt {
                                downloadUrls[path] = downloadUrl
                                callback(downloadUrls)
                            } else {
                                callback(nil)
                            }
                        })
                    } else {
                        callback(nil)
                    }
                })
            })
        } else { // base case
            callback([:])
        }
    }
}
