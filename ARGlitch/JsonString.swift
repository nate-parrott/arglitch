//
//  JsonString.swift
//  ARGlitch
//
//  Created by Nate Parrott on 11/6/17.
//  Copyright © 2017 Nate Parrott. All rights reserved.
//

import Foundation

extension String {
    static func fromJSONObject(_ object: Any) -> String? {
        do {
            let data = try JSONSerialization.data(withJSONObject: object, options: [])
            return String(data: data, encoding: .utf8)
        } catch {
            return nil
        }
    }
}
