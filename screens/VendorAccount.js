import React, { useState, useEffect, useCallback } from "react";
import { ImageBackground } from "react-native";
import { View, Text, StyleSheet } from "react-native";
import { showMessage } from "react-native-flash-message";
import * as ImagePicker from "expo-image-picker";

import { ListItem, Icon, Button, Input } from "react-native-elements";

import Firebase from "../config/Firebase";
import { ScrollView } from "react-native";
import { Image } from "react-native";

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

const VendorAccount = (props) => {
  const user = Firebase.auth().currentUser;
  const [vendorData, setVendorData] = useState();
  const [check, setCheck] = useState(false);
  const [filePath, setFilePath] = useState();

  const filePicker = async () => {
    let file = await ImagePicker.launchImageLibraryAsync();
    setFilePath(file.uri);
  };

  var vendor = async () => {
    var storage = Firebase.storage().ref();
    var newPath = user.photoURL
      ? await storage.child(user.photoURL).getDownloadURL()
      : await storage.child("images/blankProfile.png").getDownloadURL();
    setFilePath(newPath);
    const dat = await Firebase.firestore()
      .collection("vendors")
      .doc(user.uid)
      .get();
    setVendorData(dat.data());
  };
  useEffect(() => {
    vendor();
  }, [address, name, check]);
  const [name, setName] = useState(user.displayName);
  const [address, setAdress] = useState("");
  const [eMail, setEmail] = useState(user.email);
  const onSignOut = async () => {
    try {
      await Firebase.auth().signOut();
      props.navigation.replace("Authentication");
    } catch (err) {
      showMessage({
        message: "Error",
        description: err.message,
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

  const imageChange = async () => {
    try {
      await filePicker();
      if (!filePath.includes("blank")) {
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
        Firebase.auth().currentUser.updateProfile({ photoURL: loc });
        showMessage({
          message: "Image Updated Successfully",
          type: "success",
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
  const handleName = async () => {
    if (name.length <= 5) {
      showMessage({
        message: "ERROR",
        description: "Name length is less than 5!!!!",
        type: "danger",
      });
    } else {
      try {
        await user.updateProfile({
          displayName: name,
        });
        setCheck(!check);
        showMessage({
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

  const handleAddress = async () => {
    try {
      await Firebase.firestore().collection("vendors").doc(user.uid).update({
        address: address,
      });
      setCheck(!check);

      showMessage({
        message: "Address Updated",
        description: "Address is changed!!!!",
        type: "success",
      });
    } catch (err) {
      showMessage({
        message: "ERROR",
        description: err,
        type: "danger",
      });
    }
  };
  if (vendorData === undefined) {
    return (
      <View>
        <Text>LOADING......</Text>
      </View>
    );
  } else {
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
        changeText: (eve) => setEmail(eve),
        function: handleEmail,
      },
      {
        name: "New Address",
        realText: vendorData.address,
        icon: "business-outline",
        type: "ionicon",
        changeText: (eve) => setAdress(eve),
        function: handleAddress,
      },
    ];
    return (
      <ScrollView>
        <View style={styles.screen}>
          <View style={styles.imageContainer}>
            <ImageBackground source={{ uri: filePath }} style={styles.image}>
              <Image
                style={{ width: 25, height: 25, left: 172, top: 2 }}
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
                    <View style={{ width: "95%", marginLeft: 10 }}>
                      <ListItem.Title
                        style={{
                          fontSize: 17,
                          fontFamily: "roboto-light",
                        }}
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
          <View style={{ marginBottom: 10 }}>
            <Button
              raised={true}
              title="Update Password"
              onPress={() => {
                props.navigation.navigate("Passwordprofile");
              }}
              buttonStyle={{ width: 175 }}
            />
          </View>
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
                  "This option isn't available for Vendors. To delete your account contact Food N Time support team through Email"
                )
              }
              buttonStyle={{ width: 175 }}
            />
          </View>
        </View>
      </ScrollView>
    );
  }
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
    elevation: 5,
  },
  listContainer: {
    margin: 10,
    width: "95%",
  },
});

export default VendorAccount;
