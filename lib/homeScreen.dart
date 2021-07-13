import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:practice_app/widgets/sizeConfig.dart';
import 'package:practice_app/widgets/widgets.dart';
import 'package:http/http.dart' as http;

import 'models/random_data.dart';

class Home extends StatefulWidget {
  @override
  _HomeState createState() => _HomeState();
}

class _HomeState extends State<Home> {

  List usersData = [];
  bool isLoading = false;
  @override
  void initState() {
    super.initState();
    this.fetchData();
  }
  fetchData() async {
    var url = "https://randomuser.me/api/?results=6";
    var response = await http.get(Uri.parse(url));
    if(response.statusCode == 200){
      var items = json.decode(response.body)["results"];
      setState(() {
        usersData = items;
      });
    }
    else{
      setState(() {
        usersData = [];
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    SizeConfig().init(context);
    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
        backgroundColor: Colors.indigo[900],
        title: Text("Practice App",),
      ),
      body: SingleChildScrollView(
        child: Container(
          height: MediaQuery.of(context).size.height,
          width: MediaQuery.of(context).size.width,
          child: ListView.builder(
              itemCount: usersData.length,
              itemBuilder: (context , index){
                return getDataWidget(usersData[index]);
              }),
        ),
      ),
    );
  }
  Widget getDataWidget(index){
    var username = index['name']['title'] +" "+ index['name']['first'] +" "+ index['name']['last'];
    var userEmail = index['email'];
    var userImage = index['picture']['medium'];
    return GestureDetector(
      onTap: (){

      },
      child: Padding(
        padding: const EdgeInsets.all(10.0),
        child: Container(
          height: SizeConfig.screenHeight! * 0.09,
          width: SizeConfig.screenWidth! * 100,
          decoration: BoxDecoration(
            border: Border.all(width: 2,color: Colors.deepPurple),
          ),
          child: Row(
            children: [
              SizedBox(width: SizeConfig.screenWidth! * 0.03,),
              Container(
                height: SizeConfig.screenHeight! * 0.15,
                width: SizeConfig.screenWidth! * 0.15,
                decoration: new BoxDecoration(
                    border: Border.all(width: 2,color: Colors.deepPurple),
                    shape: BoxShape.circle,
                    image: DecorationImage(
                      image: NetworkImage(userImage),
                    )
                ),
              ),
              SizedBox(width: SizeConfig.screenWidth! * 0.03,),
              Column(
                children: [
                  SizedBox(height: SizeConfig.screenHeight! * 0.01,),
                  Text(username,style: GoogleFonts.poppins(
                    textStyle: TextStyle(color: Colors.deepPurple,),
                  ),),
                  Text(userEmail,style: GoogleFonts.pacifico(
                    textStyle: TextStyle(color: Colors.deepPurple,),
                  ),),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/*
ListView.builder(
itemCount: 5,
itemBuilder: (BuildContext context , index){
return myListTile();
}),
*/

/*FutureBuilder<RandomData>(
future: rData,
builder: (context, snapshot) {
if (snapshot.hasData) {
return Center(child: Text("Data Loaded"));
} else if (snapshot.hasError) {
return Text("${snapshot.error}");
}
return Center(child: CircularProgressIndicator(color: Colors.deepPurple,));
},
)*/
