var express          = require("express"),
    expressSanitizer = require("express-sanitizer"),
    methodOverride   = require("method-override"),
    bodyParser       = require("body-parser"),
    app              = express(),
    mongoose         = require("mongoose");

mongoose.connect("mongodb://localhost/blog_app");
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "Test blog",
//     image: "https://images.unsplash.com/photo-1496449903678-68ddcb189a24?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8cmFuZG9tfGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
//     body: "just a test blog post"
// });

// routes

app.get("/",function(req,res){
    res.redirect("/blogs");
});

app.get("/blogs",function(req,res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log("error");
        } else{
            res.render("index", {blogs: blogs});    //1st is the name of array that will go in ejs, 2nd is the data that is being sent
        }
    });
});

app.get("/blogs/new",function(req,res){
    res.render("new");
});

app.post("/blogs",function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body); 
    Blog.create(req.body.blog, function(err, newblog){
        if(err){
            res.render("new");
        } else{
            res.redirect("/blogs");
        }
     });
});

app.get("/blogs/:id",function(req,res){
    Blog.findById(req.params.id, function(err, result){
        if(err){
            res.redirect("/blogs");
        } else{
            res.render("show" ,{blog: result});
        }
    });
});

app.get("/blogs/:id/edit",function(req,res){
    Blog.findById(req.params.id, function(err, result){
        if(err){
            res.redirect("/blogs");
        } else{
            res.render("edit", {blog: result});
        }
    });
});

app.put("/blogs/:id",function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body); 
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, result){
        if(err){
            res.redirect("/blogs");
        } else{
            res.redirect("/blogs/" + req.params.id);
        }
    });
});
//using method override is just for the restful 
// convention, we could do something as like
// app.get("/blogs/:id/delete") and then the 
// logic to delete the that post/data
app.delete("/blogs/:id", function(req,res){      
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("blogs");
        } else{
            res.redirect("blogs");
        }
    });
});

app.listen(3000,function(){
    console.log("site has started");
});