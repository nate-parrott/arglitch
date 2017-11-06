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

class ViewController: UIViewController, ARSessionDelegate, WKScriptMessageHandler {
    var webView: WKWebView!
    let session = ARSession()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // setup web view:
        let conf = WKWebViewConfiguration()
        let contentController = WKUserContentController()
        contentController.add(self, name: "downloadModels")
        conf.userContentController = contentController
        webView = WKWebView(frame: .zero, configuration: conf)
        webView.customUserAgent = "ARGlitch-!ARKit!"
        view.insertSubview(webView, at: 0)
        reload()
        session.delegate = self
        session.delegateQueue = DispatchQueue.main
        session.run(ARWorldTrackingConfiguration())
        
        NotificationCenter.default.addObserver(forName: Model.shared.URLChangedNotification, object: nil, queue: nil) { [weak self] (_) in
            self?.reload()
        }
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        downloadModels(placeholderId: "id1")
    }
    
    override var supportedInterfaceOrientations: UIInterfaceOrientationMask {
        return UIInterfaceOrientationMask.portrait
    }
    
    func session(_ session: ARSession, didUpdate frame: ARFrame) {
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
    
    func reload() {
        webView.load(URLRequest(url: Model.shared.selectedURL))
    }
    
    // MARK: WebView bridge
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if message.name == "downloadModels", let params = message.body as? [String: Any], let placeholderId = params["placeholderId"] as? String {
            downloadModels(placeholderId: placeholderId)
        }
    }
    
    func downloadModels(placeholderId: String) {
        print("placeholder id: \(placeholderId)")
        let browser = storyboard!.instantiateViewController(withIdentifier: "DownloaderBrowser") as! DownloaderBrowser
        let nav = UINavigationController(rootViewController: browser)
        present(nav, animated: true, completion: nil)
    }
}
