//
//  Model.swift
//  ARGlitch
//
//  Created by Nate Parrott on 10/25/17.
//  Copyright © 2017 Nate Parrott. All rights reserved.
//

import Foundation

class Model {
    static let shared = Model()
    
    let URLChangedNotification = Notification.Name("com.nateparrott.arglitch.Model.selectedURL.changed")
    
    var selectedURL: URL {
        get {
            return recentURLs.first!
        }
        set(val) {
            var recents = recentURLs
            if let idx = recents.index(of: val) {
                recents.remove(at: idx)
            }
            recents = [val] + recents
            while recents.count > 10 { recents.removeLast() }
            recentURLs = recents
            NotificationCenter.default.post(name: URLChangedNotification, object: nil)
        }
    }
    
    private let recentURLsDefaultsKey = "com.nateparrott.arglitch.Model.recentURLs"
    
    var recentURLs: [URL] {
        get {
            if let data = UserDefaults.standard.value(forKey: recentURLsDefaultsKey) as? Data,
                let urls = NSKeyedUnarchiver.unarchiveObject(with: data) as? [URL],
                urls.count > 0 {
                return urls
            } else {
                return [URL(string: "https://ar-edit.firebaseapp.com/")!]
            }
        }
        set(val) {
            let data = NSKeyedArchiver.archivedData(withRootObject: val)
            UserDefaults.standard.setValue(data, forKey: recentURLsDefaultsKey)
        }
    }
}
