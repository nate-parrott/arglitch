//
//  URLPickerTableViewController.swift
//  ARGlitch
//
//  Created by Nate Parrott on 10/25/17.
//  Copyright © 2017 Nate Parrott. All rights reserved.
//

import UIKit

class URLPickerTableViewController: UITableViewController {

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        URLs = Model.shared.recentURLs
    }
    
    var URLs = [URL]() {
        didSet {
            tableView.reloadData()
        }
    }
    
    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return URLs.count
    }
    
    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "Cell")!
        cell.textLabel!.text = URLs[indexPath.row].absoluteString
        return cell
    }
    
    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        Model.shared.selectedURL = URLs[indexPath.row]
        dismiss()
    }
    
    @IBAction func dismiss() {
        navigationController!.dismiss(animated: true, completion: nil)
    }
    
    @IBAction func addSite() {
        let action = UIAlertController(title: "What's the URL of your project?", message: nil, preferredStyle: .alert)
        action.addTextField { (field) in
            field.keyboardType = .URL
            // field.placeholder = self.url
        }
        action.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
        action.addAction(UIAlertAction(title: "Go", style: .default, handler: { (_) in
            if let text = action.textFields![0].text, text != "", let url = URL(string: text) {
                Model.shared.selectedURL = url
                self.dismiss()
            }
        }))
        present(action, animated: true, completion: nil)
    }

}
