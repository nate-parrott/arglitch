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
    // MARK: IB
    @IBOutlet var webView: WKWebView!
    @IBOutlet var urlField: UITextField!
    @IBOutlet var downloadDetectedFileButton: UIButton!
    
    @IBAction func dismiss() {
        navigationController?.dismiss(animated: true, completion: nil)
    }
    
    @IBAction func downloadDetected() {
        
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
    
    func webView(_ webView: WKWebView, didCommit navigation: WKNavigation!) {
        detectedDownloadUrl = nil
        if !urlField.isFirstResponder {
            urlField.text = webView.url?.absoluteString ?? ""
        }
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        detectedDownloadUrl = detectDownloadUrl()
    }
    
    // MARK: UI
    
    var detectedDownloadUrl: URL? {
        didSet {
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
    
    // MARK: Helpers
    
    func detectDownloadUrl() -> URL? {
        return nil
        // TODO
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
