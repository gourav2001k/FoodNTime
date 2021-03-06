import React from "react";

import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";

import { HeaderButtons, Item } from "react-navigation-header-buttons";
import Filters from "../screens/Filters";

import HeaderButtonss from "../components/HeaderButtonss";
import UserNavigator from "./UserNavigator";
import Colors from "../constants/colors";
const defaultNavigationOption = {
  headerStyle: {
    backgroundColor: Platform.OS === "ios" ? "" : Colors.primaryColor,
  },
  headerTitleStyle: { fontFamily: "roboto-light" },
  headerTintColor: Platform.OS === "ios" ? Colors.primaryColor : "white",
};

const StackFilter = createStackNavigator();

const FilterNavigator = () => {
  return (
    <StackFilter.Navigator>
      <StackFilter.Screen
        name="Filters Screen"
        component={Filters}
        options={({ navigation, route }) => ({
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
    </StackFilter.Navigator>
  );
};

const Drawer = createDrawerNavigator();

const FilterDrawerNavigator = () => {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Meals" component={UserNavigator} />
      <Drawer.Screen name="Search Filters" component={FilterNavigator} />
    </Drawer.Navigator>
  );
};

export default FilterDrawerNavigator;
