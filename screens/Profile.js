import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ImageBackground, Alert } from "react-native";
import { showMessage } from "react-native-flash-message";
import * as ImagePicker from "expo-image-picker";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { ListItem, Icon, Button, Input, Image } from "react-native-elements";

import Firebase from "../config/Firebase";
import { ScrollView } from "react-native";
import greenTick from "../assets/greenTick.jpg";
import redTick from "../assets/redTick.png";

const makeID = (length) => {
  var result = [];
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result.push(
      characters.charAt(Math.floor(Math.random() * charactersLength))
    );
  }
  return result.join("");
};

const Profile = (props) => {
  const user = Firebase.auth().currentUser;

  const [name, setName] = useState(user.displayName);
  const [eMail, seteMail] = useState(user.email);
  const [filePath, setFilePath] = useState();
  useEffect(() => {
    const func = async () => {
      var storage = Firebase.storage().ref();
      var newPath = user.photoURL
        ? await storage.child(user.photoURL).getDownloadURL()
        : await storage.child("images/blankProfile.png").getDownloadURL();
      setFilePath(newPath);
    };
    func();
  }, []);

  const filePicker = async () => {
    let file = await ImagePicker.launchImageLibraryAsync();
    setFilePath(file.uri);
  };

  const onSignOut = async () => {
    try {
      if (user.providerData[0].providerId.includes("google")) {
        GoogleSignin.configure({
          offlineAccess: true,
          webClientId: process.env.GOOGLE_OAUTH_ID_WEB,
          androidClientId: process.env.GOOGLE_OAUTH_ID_ANDROID,
          scopes: ["profile", "email"],
        });
        await GoogleSignin.revokeAccess();
      }
      await Firebase.auth().signOut();
    } catch (err) {
      console.log(err);
      showMessage({
        message: "Error",
        description: err.message,
        type: "danger",
      });
    }
  };
  const handleName = async () => {
    if (name.length <= 5) {
      showMessage({
        message: "ERROR",
        description: "Name length is less than 5!!!!",
        type: "danger",
      });
    } else {
      var db = Firebase.firestore();
      try {
        await user.updateProfile({
          displayName: name,
        });
        await db.collection("users").doc(user.uid).update({ name: name });
        await showMessage({
          message: "Name Updated",
          description: "Name is changed!!!!",
          type: "success",
        });
      } catch (err) {
        showMessage({
          message: "ERROR",
          description: err,
          type: "danger",
        });
      }
    }
  };
  const handleEmail = () => {
    console.log(eMail);
  };
  const imageChange = async () => {
    try {
      await filePicker();
      console.log(filePath);
      if (!filePath.includes("token")) {
        // Create the file metadata
        var storageRef = Firebase.storage().ref();
        if (user.photoURL && !user.photoURL.includes("blankProfile")) {
          storageRef.child(user.photoURL).delete();
        }
        var metadata = {
          contentType: "image/jpeg",
        };
        const response = await fetch(filePath);
        const blob = await response.blob();
        // Upload file and metadata to the object 'images/mountains.jpg'
        var loc = "images/" + makeID(8) + "-" + Date.now().toString() + ".jpg";
        await storageRef.child(loc).put(blob, metadata);
        await user.updateProfile({ photoURL: loc });
        showMessage({
          message: "Image Updated Successfully",
          type: "success",
        });
      } else {
        showMessage({
          message: "Something Went Wrong",
          description: "Try Again",
          type: "danger",
        });
      }
    } catch (err) {
      showMessage({
        message: "Something Went Wrong",
        description: "Try Again",
        type: "danger",
      });
    }
  };

  const verifyEmail = async () => {
    try {
      await user.sendEmailVerification();
      showMessage({
        message: "Email Sent",
        description: "Check your Email to verify your Account",
        type: "success",
      });
    } catch (err) {
      showMessage({
        message: "Something Went Wrong",
        description: "Try Again",
        type: "danger",
      });
    }
  };

  const deleteAccount = async () => {
    try {
      var db = Firebase.firestore();
      await db.collection("users").doc(user.uid).delete();
      if (user.providerData[0].providerId.includes("google")) {
        await GoogleSignin.revokeAccess();
      }
      var storageRef = Firebase.storage().ref();
      if (user.photoURL && !user.photoURL.includes("blankProfile")) {
        await storageRef.child(user.photoURL).delete();
      }
      await user.delete();
      showMessage({
        message: "Account Deleted Successfully",
        description: "We are sad to see you Go",
        type: "success",
      });
    } catch (err) {
      showMessage({
        message: "Something Went Wrong",
        description: err.message,
        type: "danger",
      });
    }
  };

  const list = [
    {
      name: "New Name",
      realText: user.displayName,
      icon: "person-outline",
      type: "ionicon",
      changeText: (eve) => setName(eve),
      function: handleName,
    },
    {
      name: "E-Mail",
      realText: user.email,
      icon: "mail-open-outline",
      type: "ionicon",
      changeText: (eve) => seteMail(eve),
      function: handleEmail,
    },
  ];

  return (
    <ScrollView>
      <View style={styles.screen}>
        <View style={styles.imageContainer}>
          <ImageBackground source={{ uri: filePath }} style={styles.image}>
            <Image
              style={{
                width: 25,
                height: 25,
                left: 172,
                top: 3,
              }}
              source={user.emailVerified ? greenTick : redTick}
            />
          </ImageBackground>
          <View
            style={{
              top: 145,
              left: -50,
              elevation: 5,
            }}
          >
            <Icon
              name="camera"
              type="ionicon"
              size={26}
              raised
              onPress={imageChange}
            />
          </View>
        </View>
        <View style={styles.listContainer}>
          {list.map((l, i) => (
            <ListItem key={i} bottomDivider>
              <Icon name={l.icon} type={l.type} style={{ marginLeft: 20 }} />
              <ListItem.Content style={{ marginLeft: 20 }}>
                {l.name !== "E-Mail" ? (
                  <View style={{ width: "95%" }}>
                    <Input
                      placeholder={l.name}
                      onChangeText={l.changeText}
                      label={l.realText}
                      errorStyle={{ color: "red" }}
                    />
                  </View>
                ) : (
                  <View style={{ width: "95%" }}>
                    <ListItem.Title
                      style={{ fontSize: 17, fontFamily: "roboto-light" }}
                    >
                      {l.name} :
                    </ListItem.Title>
                    <Text
                      numberOfLines={2}
                      style={{ fontSize: 18, fontFamily: "roboto-regular" }}
                    >
                      {l.realText}
                    </Text>
                  </View>
                )}
              </ListItem.Content>
              {l.name !== "E-Mail" ? (
                <View
                  style={{ justifyContent: "center", alignItems: "center" }}
                >
                  <Icon
                    name="create-outline"
                    type="ionicon"
                    onPress={l.function}
                  />
                  <Text>Update</Text>
                </View>
              ) : null}
            </ListItem>
          ))}
        </View>
        <View style={{ paddingTop: 10, marginBottom: 10 }}>
          <Button
            raised={true}
            title="Sign Out"
            onPress={onSignOut}
            buttonStyle={{ width: 175 }}
          />
        </View>
        {!user.providerData[0].providerId.includes("google") ? (
          <View style={{ marginBottom: 10 }}>
            <Button
              raised={true}
              title="Update Password"
              onPress={() => {
                props.navigation.navigate("Update Password");
              }}
              buttonStyle={{ width: 175 }}
            />
          </View>
        ) : null}
        {!user.emailVerified ? (
          <View style={{ marginBottom: 10 }}>
            <Button
              raised={true}
              title="Verify Email"
              onPress={verifyEmail}
              buttonStyle={{ width: 175 }}
            />
          </View>
        ) : null}
        <View style={{ marginBottom: 10 }}>
          <Button
            raised={true}
            title="Delete your Account"
            onPress={() =>
              Alert.alert(
                "Account Deletion",
                "This action is irreversible. Do you want to continue?",
                [
                  {
                    text: "Yes",
                    onPress: deleteAccount,
                  },
                  {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel",
                  },
                ]
              )
            }
            buttonStyle={{ width: 175 }}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    flexDirection: "row",
  },
  image: {
    marginLeft: 70,
    width: 200,
    height: 200,
    borderTopLeftRadius: 40,
    overflow: "hidden",
    elevation: 2,
  },
  listContainer: {
    margin: 10,
    width: "95%",
  },
});

export default Profile;
