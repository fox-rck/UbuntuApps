var formidable = require('formidable'),
    http = require('http'),
    util = require('util');
    fs = require('fs'),
    path = require('path');

http.createServer(function (req, res) {
    if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
        upload();
    }
    if (req.url == '/file') {
        getfile();
    }

    // show a file upload form
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(
      '<form action="/upload" enctype="multipart/form-data" method="post">' +
      '<input type="file" name="file" multiple="multiple"><br>' +
      '<input type="submit" value="Upload">' +
      '</form>'
    );
    function getfile() {
        var filePath = path.join("uploads", '0c380e3f40a7fec0b3597b9b9cd10444.jpg');
        var stat = fs.statSync(filePath);
        console.log(filePath);
        res.writeHead(200, {
            'Content-Type': 'image/JPEG',
            'Content-Length': stat.size
        });

        var readStream = fs.createReadStream(filePath);
        // We replaced all the event handlers with a simple call to readStream.pipe()
        readStream.pipe(res);
    }
    function upload() {
        // parse a file upload
        var form = new formidable.IncomingForm();

        form.parse(req, function (err, fields, files) {
            // `file` is the name of the <input> field of type `file`
            var old_path = files.file.path,
                file_size = files.file.size,
                file_ext = files.file.name.split('.').pop(),
                index = old_path.lastIndexOf('/') + 1,
                file_name = old_path.substr(index),
                new_path = path.join(process.env.PWD, '/uploads/', file_name + '.' + file_ext);

            fs.readFile(old_path, function (err, data) {
                fs.writeFile(new_path, data, function (err) {
                    fs.unlink(old_path, function (err) {
                        if (err) {
                            res.writeHead(500);
                            res.end('error');
                        } else {
                            res.writeHead(200);
                            res.end(new_path);
                        }
                    });
                });
            });
        });
        return;
    }
}).listen(3000);