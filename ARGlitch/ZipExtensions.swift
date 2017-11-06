//
//  ZipExtensions.swift
//  ARGlitch
//
//  Created by Nate Parrott on 11/6/17.
//  Copyright © 2017 Nate Parrott. All rights reserved.
//

import Foundation
import ZIPFoundation

extension Archive {
    func extractData(from entry: Archive.Element, callback: (Data?) -> ()) {
        var data = Data()
        do {
            _ = try extract(entry, consumer: { (moreData) in
                data.append(moreData)
            })
            callback(data)
        } catch {
            callback(nil)
        }
    }
}
