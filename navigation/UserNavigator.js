import React from "react";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

import { HeaderButtons, Item } from "react-navigation-header-buttons";

import Orders from "../screens/Orders";
import OrderDetails from "../screens/OrderDetails";
import HomePage from "../screens/HomePage";
import Profile from "../screens/Profile";
import Cart from "../screens/Cart";
import HeaderButtonss from "../components/HeaderButtonss";
import Colors from "../constants/colors";

import MealDetails from "../screens/MealDetails";
import PasswordProfile from "../screens/PasswordProfile";

const OrderStack = createStackNavigator();
const OrderNavigator = () => {
  return (
    <OrderStack.Navigator>
      <OrderStack.Screen
        name="Order"
        component={Orders}
        options={{ headerShown: false }}
      />
      <OrderStack.Screen
        name="Order Details"
        component={OrderDetails}
        options={{ headerShown: false }}
      />
    </OrderStack.Navigator>
  );
};
const ProfileStack = createStackNavigator();
const ProfileNavigator = () => {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        options={{ headerShown: false }}
        name="Profile"
        component={Profile}
      />
      <ProfileStack.Screen
        options={{ headerShown: false }}
        name="Update Password"
        component={PasswordProfile}
      />
    </ProfileStack.Navigator>
  );
};

const Tab = createMaterialBottomTabNavigator();
const tabBarOption = {
  activeColor: Colors.primaryColor,
  shifting: true,
};
const UserTab = () => {
  return (
    <Tab.Navigator {...tabBarOption}>
      <Tab.Screen
        name="Meals"
        component={HomePage}
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            return (
              <Ionicons size={23} color={color} name="fast-food-outline" />
            );
          },
          tabBarColor: Colors.accentColor,
        }}
      />
      <Tab.Screen
        name="Order"
        component={OrderNavigator}
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            return <Ionicons size={23} color={color} name="ios-restaurant" />;
          },
          tabBarColor: "grey",
        }}
      />
      <Tab.Screen
        name="Account"
        component={ProfileNavigator}
        options={{
          tabBarIcon: ({ focused, color, size }) => {
            return <FontAwesome size={23} color={color} name="user" />;
          },
          tabBarColor: Colors.accentColor,
        }}
      />
    </Tab.Navigator>
  );
};

const Stack = createStackNavigator();

const UserNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Meals"
        component={UserTab}
        options={({ navigation, route }) => ({
          headerTitle:
            getFocusedRouteNameFromRoute(route) === "undefined"
              ? "Meals"
              : getFocusedRouteNameFromRoute(route),
          headerRight: () => {
            return (
              <HeaderButtons HeaderButtonComponent={HeaderButtonss}>
                <Item
                  title="fav"
                  iconName="cart-outline"
                  onPress={() => navigation.navigate("Cart")}
                />
              </HeaderButtons>
            );
          },
          headerLeft: () => (
            <HeaderButtons HeaderButtonComponent={HeaderButtonss}>
              <Item
                title="Menu"
                iconName="ios-menu"
                onPress={() => {
                  navigation.toggleDrawer();
                }}
              />
            </HeaderButtons>
          ),
        })}
      />
      <Stack.Screen name="Cart" component={Cart} />
      <Stack.Screen
        name="mealDetail"
        component={MealDetails}
        options={({ navigation, route }) => ({
          headerRight: () => (
            <HeaderButtons HeaderButtonComponent={HeaderButtonss}>
              <Item
                title="fav"
                iconName="cart-outline"
                onPress={() => navigation.navigate("Cart")}
              />
            </HeaderButtons>
          ),
        })}
      />
    </Stack.Navigator>
  );
};

export default UserNavigator;
