//
//  ViewController.swift
//  ARGlitch
//
//  Created by Nate Parrott on 10/4/17.
//  Copyright © 2017 Nate Parrott. All rights reserved.
//

import UIKit
import WebKit
import ARKit

class ViewController: UIViewController, ARSessionDelegate {
    let webView = WKWebView()
    let session = ARSession()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        view.insertSubview(webView, at: 0)
        reload()
        session.delegate = self
        session.delegateQueue = DispatchQueue.main
        session.run(ARWorldTrackingConfiguration())
    }
    
    override var supportedInterfaceOrientations: UIInterfaceOrientationMask {
        return UIInterfaceOrientationMask.portrait
    }
    
    func session(_ session: ARSession, didUpdate frame: ARFrame) {
//        let matrix = frame.camera.viewMatrix(for: .portrait)
//        let c = matrix.transpose.columns
//        let str = "" +
//        "\(c.0.x), \(c.1.x), \(c.2.x), \(c.3.x)," +
//        "\(c.0.y), \(c.1.y), \(c.2.y), \(c.3.y)," +
//        "\(c.0.z), \(c.1.z), \(c.2.z), \(c.3.z)," +
//        "\(c.0.w), \(c.1.w), \(c.2.w), \(c.3.w)"
//        webView.evaluateJavaScript("(function() { let m = new THREE.Matrix4(); m.set(\(str)); window.updateMatrix(m) } )()", completionHandler: nil)
        let pos = frame.camera.computePosition()
        webView.evaluateJavaScript("updatedARPosition({ x: \(pos.x), y: \(pos.y), z: \(pos.z), q0: \(pos.q0), q1: \(pos.q1), q2: \(pos.q2), q3: \(pos.q3) })", completionHandler: { (_, err) in
            if let e = err {
                print("\(e)")
            }
        })
    }
    
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        webView.frame = view.bounds
    }
    
    override var prefersStatusBarHidden: Bool {
        return true
    }
    
    @IBAction func changeSite() {
        let action = UIAlertController(title: "What's the URL of your project?", message: nil, preferredStyle: .alert)
        action.addTextField { (field) in
            field.keyboardType = .URL
            field.placeholder = self.url
        }
        action.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
        action.addAction(UIAlertAction(title: "Go", style: .default, handler: { (_) in
            if let text = action.textFields![0].text, text != "" {
                self.url = text
            } else {
                let u = self.url
                self.url = u
            }
        }))
        present(action, animated: true, completion: nil)
    }
    
    var url: String {
        get {
            return UserDefaults.standard.value(forKey: "url") as? String ?? "https://arzone.glitch.me"
        }
        set(v) {
            if URL(string: v) != nil {
                UserDefaults.standard.setValue(v, forKey: "url")
                reload()
            }
        }
    }
    
    func reload() {
        webView.load(URLRequest(url: URL(string: url)!))
    }
}
