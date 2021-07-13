import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:practice_app/widgets/sizeConfig.dart';

class detailScreen extends StatefulWidget {
  String userName;
  String email;
  String img;
  String age;
  detailScreen(this.userName,this.email,this.img,this.age);
  @override
  _detailScreenState createState() => _detailScreenState();
}

class _detailScreenState extends State<detailScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          SizedBox(height: SizeConfig.blockSizeHorizontal! * 30,),
          Center(
            child: Container(
              height: SizeConfig.screenHeight! * 0.2,
              width: SizeConfig.screenWidth! * 0.4,
              decoration: new BoxDecoration(
                  border: Border.all(width: 2,color: Colors.deepPurple),
                  borderRadius: BorderRadius.only(bottomLeft: Radius.circular(80),bottomRight: Radius.circular(80),topLeft: Radius.circular(80),topRight: Radius.circular(80)),
                  image: DecorationImage(
                    image: NetworkImage(widget.img,),fit: BoxFit.fill,
                  )
              ),
            ),
          ),
          SizedBox(height: SizeConfig.screenHeight! * 0.01,),
          Text(widget.userName,style: GoogleFonts.poppins(
            fontSize: SizeConfig.blockSizeHorizontal! * 7,
            textStyle: TextStyle(color: Colors.deepPurple,),
          ),),
          Text(widget.email,style: GoogleFonts.pacifico(
            fontSize: SizeConfig.blockSizeHorizontal! * 5,
            textStyle: TextStyle(color: Colors.deepPurple,),
          ),),
          SizedBox(height: SizeConfig.screenHeight! * 0.01,),
          Text(widget.age,style: GoogleFonts.poppins(
            fontSize: SizeConfig.blockSizeHorizontal! * 5,
            textStyle: TextStyle(color: Colors.deepPurple,),
          ),),
        ],
      ),
    );
  }
}
