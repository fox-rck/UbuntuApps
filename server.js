var formidable = require('formidable'),
    http = require('http'),
    util = require('util');
    fs = require('fs'),
    path = require('path');
    var express = require('express')
    var app = express();
    var router = express.Router();
    var mongo = require('mongodb');

    var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

    var dbserver = new Server('localhost', 27017, { auto_reconnect: true });
    db = new Db('fileServer', dbserver);
    var collection;
    db.open(function (err, db) {
        if (!err) {
            console.log("Connected to 'fileServer' database");
            collection = db.collection('File');
        }
    });

    app.set('views', __dirname + '/app/views')

    router.use(function (req, res, next) {
        console.log('Time:', Date.now());
        next();
    });
    router.get('/', function (req, res, next) {
        res.writeHead(200, { 'content-type': 'text/html' });
        res.end(
            '<form action="/upload" enctype="multipart/form-data" method="post">' +
            '<input type="file" name="file" multiple="multiple"><br>' +
            '<input type="submit" value="Upload">' +
            '</form>'
        );
    });
    // a middleware sub-stack shows request info for any type of HTTP request to /user/:id
    router.use('/file/:id', function (req, res, next) {
        console.log('Request URL:', req.originalUrl);
        next();
    }, function (req, res, next) {
        console.log('Request Type:', req.method);
        next();
    });

    // a middleware sub-stack which handles GET requests to /user/:id
    router.get('/file/:id', function (req, res, next) {
        // if user id is 0, skip to the next router
        if (req.params.id == 0) next('route');
            // else pass the control to the next middleware in this stack
        else next(); // 
    }, function (req, res, next) {
        // render a regular page
        collection.find({ _id: req.params.id }).toArray(function (err, results) {
            console.dir(results);
            if (results[0]) {
                var filePath = path.join(process.env.PWD, '/uploads/', results[0].name + '.' + results[0].ext);
                var stat = fs.statSync(filePath);
                console.log(filePath);
                res.writeHead(200, {
                    'Content-Type': 'image/JPEG',
                    'Content-Length': stat.size
                });

                var readStream = fs.createReadStream(filePath);
                // We replaced all the event handlers with a simple call to readStream.pipe()
                readStream.pipe(res);
            } else {
                res.end("File not found");
            }
        // Let's close the db
    });
      
    });

    // handler for /user/:id which renders a special page
    router.get('/file/:id', function (req, res, next) {
        console.log(req.params.id);
        res.end('special:' + req.params.id);
    });

    // handler for /user/:id which renders a special page
    router.post('/upload', function (req, res, next) {
        upload(req, res, next)
    });

    function upload(req, res, next) {
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
                                    var newElm = collection.insert({ name: file_name, ext: file_ext }, function (err, docsInserted) {
                                        console.log(docsInserted);
                                        res.writeHead(200);
                                        res.end(docsInserted[0]._id);
                                    })
                                 
                                }
                            });
                        });
                    });
                });
                return;
            }
    // mount the router on the app
    app.use('/', router);

    var server = app.listen(3000, function () {

        var host = server.address().address
        var port = server.address().port

        console.log('Example app listening at http://%s:%s', host, port)

    })

//    var server = app.listen(3000, function () {

//        var host = server.address().address
//        var port = server.address().port

//        console.log('Example app listening at http://%s:%s', host, port)

//    })

//http.createServer(function (req, res) {
//    if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
//        upload();
//    }
//    if (req.url == '/file') {
//        getfile();
//    }
//    if (req.url == '/') {
//        // show a file upload form
//        res.writeHead(200, { 'content-type': 'text/html' });
//        res.end(
//          '<form action="/upload" enctype="multipart/form-data" method="post">' +
//          '<input type="file" name="file" multiple="multiple"><br>' +
//          '<input type="submit" value="Upload">' +
//          '</form>'
//        );
//    }
   
//    function getfile() {
//        var filePath = path.join(process.env.PWD, '/uploads/', '0c380e3f40a7fec0b3597b9b9cd10444.jpg');
//        var stat = fs.statSync(filePath);
//        console.log(filePath);
//        res.writeHead(200, {
//            'Content-Type': 'image/JPEG',
//            'Content-Length': stat.size
//        });

//        var readStream = fs.createReadStream(filePath);
//        // We replaced all the event handlers with a simple call to readStream.pipe()
//        readStream.pipe(res);
//    }
//    function upload() {
//        // parse a file upload
//        var form = new formidable.IncomingForm();

//        form.parse(req, function (err, fields, files) {
//            // `file` is the name of the <input> field of type `file`
//            var old_path = files.file.path,
//                file_size = files.file.size,
//                file_ext = files.file.name.split('.').pop(),
//                index = old_path.lastIndexOf('/') + 1,
//                file_name = old_path.substr(index),
//                new_path = path.join(process.env.PWD, '/uploads/', file_name + '.' + file_ext);

//            fs.readFile(old_path, function (err, data) {
//                fs.writeFile(new_path, data, function (err) {
//                    fs.unlink(old_path, function (err) {
//                        if (err) {
//                            res.writeHead(500);
//                            res.end('error');
//                        } else {
//                            res.writeHead(200);
//                            res.end(new_path);
//                        }
//                    });
//                });
//            });
//        });
//        return;
//    }
//}).listen(3000);