//
//  DownloaderBrowser.swift
//  ARGlitch
//
//  Created by Nate Parrott on 11/6/17.
//  Copyright © 2017 Nate Parrott. All rights reserved.
//

import UIKit
import WebKit

class DownloaderBrowser : UIViewController, WKNavigationDelegate, UITextFieldDelegate {
    // MARK: External API
    enum Result {
        case cancelled
        case choseUrl(URL)
    }
    var callback: ((Result) -> ())?
    
    // TODO: if a user navigates to a zip or obj file, we should try to download it
    
    // MARK: IB
    @IBOutlet var webView: WKWebView!
    @IBOutlet var urlField: UITextField!
    @IBOutlet var downloadDetectedFileButton: UIButton!
    
    @IBAction func cancel() {
        navigationController?.dismiss(animated: true, completion: nil)
        callback?(.cancelled)
    }
    
    @IBAction func downloadDetected() {
        if let url = detectedDownloadUrl {
            navigationController?.dismiss(animated: true, completion: nil)
            chose(url: url)
        }
    }
    
    @IBAction func goBack() {
        webView.goBack()
    }
    
    let defaultUrl = "https://poly.google.com"
    override func viewDidLoad() {
        super.viewDidLoad()
        detectedDownloadUrl = nil
        webView.navigationDelegate = self
        webView.load(URLRequest(url: URL(string: defaultUrl)!))
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        statusLoopRunning = true
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(true)
        statusLoopRunning = false
    }
    
//    func webView(_ webView: WKWebView, didCommit navigation: WKNavigation!) {
//        detectedDownloadUrl = nil
//        if !urlField.isFirstResponder {
//            urlField.text = webView.url?.absoluteString ?? ""
//        }
//    }
//
//    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
//        detectDownloadUrl()
//    }
    
    // MARK: UI
    
    var detectedDownloadUrl: URL? {
        didSet {
            if let url = detectedDownloadUrl { print("Detected url: \(url)") }
            downloadDetectedFileButton.isHidden = (detectedDownloadUrl == nil)
        }
    }
    
    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        // called by the url field
        if let url = createURL(from: textField.text ?? "") {
            textField.text = url.absoluteString
            webView.load(URLRequest(url: url))
        }
        textField.resignFirstResponder()
        return false
    }
    
    func chose(url: URL) {
        navigationController?.dismiss(animated: true, completion: nil)
        callback?(.choseUrl(url))
    }
    
    // MARK: Status update loop
    var statusLoopRunning = false {
        didSet {
            if statusLoopRunning {
                if statusLoopTimer == nil {
                    statusLoop()
                    statusLoopTimer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true, block: { [weak self] (_) in
                        self?.statusLoop()
                    })
                }
            } else {
                statusLoopTimer?.invalidate()
                statusLoopTimer = nil
            }
        }
    }
    
    var statusLoopTimer: Timer?
    
    func statusLoop() {
        if !urlField.isFirstResponder {
            urlField.text = webView.url?.absoluteString ?? ""
        }
        detectDownloadUrl()
    }
    
    // MARK: Helpers
    
    func detectDownloadUrl() {
        let js = """
        (function() {
          let results = Array.from(document.querySelectorAll('[jsname]')).map((node) => node.getAttribute('data-value')).filter((v) => v && v.endsWith('.zip') && v.startsWith('https://vr.google.com/downloads/'));
          return results.length ? results[0] : null;
        })()
"""
        webView.evaluateJavaScript(js) { (result, err) in
            if let e = err {
                print("Error detecting model download url: \(e)")
            } else {
                if let urlString = result as? String, let url = URL(string: urlString) {
                    self.detectedDownloadUrl = url
                } else {
                    self.detectedDownloadUrl = nil
                }
            }
        }
    }
    
    func createURL(from string: String) -> URL? {
        if string.contains(" ") || !string.contains(".") {
            var comps = URLComponents(string: "https://google.com/search?q=X")!
            comps.queryItems![0].value = string
            return comps.url!
        }
        if string.starts(with: "https://") || string.starts(with: "http://") {
            return URL(string: string)
        } else {
            return URL(string: "https://" + string)
        }
    }
}
