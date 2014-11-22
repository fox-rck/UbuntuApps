var formidable = require('formidable'),
    http = require('http'),
    util = require('util');
    fs = require('fs'),
    path = require('path');

http.createServer(function (req, res) {
    if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
        // parse a file upload
        var form = new formidable.IncomingForm();

        form.parse(req, function(err, fields, files) {
            // `file` is the name of the <input> field of type `file`
            var old_path = files.file.path,
                file_size = files.file.size,
                file_ext = files.file.name.split('.').pop(),
                index = old_path.lastIndexOf('/') + 1,
                file_name = old_path.substr(index),
                new_path = path.join(process.env.PWD, '/uploads/', file_name + '.' + file_ext);
            
            fs.readFile(old_path, function(err, data) {
                fs.writeFile(new_path, data, function(err) {
                    fs.unlink(old_path, function(err) {
                        if (err) {
                            res.writeHead(500);
                            res.end('error');
                        } else {
                            res.writeHead(200);
                            res.end(new_path );
                        }
                    });
                });
            });
        });
        return;
    }

    // show a file upload form
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(
      '<form action="/upload" enctype="multipart/form-data" method="post">' +
      '<input type="file" name="file" multiple="multiple"><br>' +
      '<input type="submit" value="Upload">' +
      '</form>'
    );
}).listen(3000);