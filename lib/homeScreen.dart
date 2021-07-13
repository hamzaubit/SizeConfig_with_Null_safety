import 'package:flutter/material.dart';
import 'package:practice_app/widgets/sizeConfig.dart';
import 'package:practice_app/widgets/widgets.dart';

class Home extends StatefulWidget {
  @override
  _HomeState createState() => _HomeState();
}

class _HomeState extends State<Home> {
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
        child: myListTile(),
      ),
    );
  }
}