
const express= require("express");
const bodyParser= require("body-parser");
const mongoose= require("mongoose");
const _= require("lodash");


const app= express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb+srv://admin:admin@cluster0.bfxkl.mongodb.net/todosDB",{useNewUrlParser:true,useUnifiedTopology: true});

//Mongoose Schema, instances
const itemsSchema= {
    name: String
};

//Model for schemas
const Item= mongoose.model(
    "Item",itemsSchema
);

// documents for schemas

const item1= new Item({
    name: "Eat"
});

const item2= new Item({
    name: "Code"
});

const item3= new Item({
    name: "Sleep"
});

const InitialItems= [item1, item2, item3];

//schema for user search sub url, customLists
const listSchema={
    name: String,
    items:[itemsSchema]

};

//schema for user search urls
const List= mongoose.model("Category",listSchema);



//get method to render our content in home page
app.get("/", (req, res)=>{

    Item.find({},(err, trackedItems)=>{

        if(trackedItems.length===0){
              Item.insertMany(InitialItems, (err) => {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("successfully inserted to DB");
                  }
                });
        res.redirect("/");
            }

        else{
            res.render("lists", {itemTitle: "Today", newItems: trackedItems});
        }
    });
    
  
});

//Route for url search tab, express routing method

app.get("/:customListName", (req,res)=>{
    const customListName= _.capitalize(req.params.customListName);

    // when user tries to navigate in url for sub categories

    List.findOne({name: customListName}, (err, results )=>{
        
        //the result returns obj here, in find method returns an ARRAY
        if(!err){
            if(!results){
                //creating new list here
                const list= new List({
                    name: customListName,
                    items: InitialItems
                });
            
                list.save();
                res.redirect("/" + customListName);
            }
            else{
                //path for showing an existing list

                res.render("lists", {itemTitle: results.name, newItems: results.items});
            }
        }

    });
   


});

//Adding new items to our todos
app.post("/" , (req, res)=>{

    const itemName= req.body.addItem;
    const listName= req.body.lists;
    
    const item= new Item({
        name: itemName
    });

    if(listName=== "Today"){
        item.save();
        res.redirect("/");

    }
    else{
        List.findOne({name: listName}, (err, trackedItems)=>{
           
            trackedItems.items.push(item);
            trackedItems.save();
            res.redirect("/" + listName);
        });
    }
    
});

//To delete our item in todos

app.post("/delete", (req, res)=>{

    const checkedId=req.body.deleteItem;
    const listName= req.body.lists;

    if(listName==="Today"){
        Item.findByIdAndRemove(checkedId, (err)=>{
            if(!err) {
                console.log("successfully deleted");
                res.redirect("/");
            }
        });
    }

        else{
            List.findOneAndUpdate({name: listName},{$pull:{items: {_id:checkedId}}},(err, foundList)=>{
                if(!err){
                    res.redirect("/" + listName);
                }

            });

        }

    });



app.get("/about", (req, res)=>{
    res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);

app.listen(port, ()=>{
    console.log("server started at port 3000");
});


