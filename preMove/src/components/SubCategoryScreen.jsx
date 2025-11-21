import React from "react";
import { ScrollView, TouchableOpacity, Text } from "react-native";

const SubCategoryList = ({ subCategories, selectedSubCat, onSelect }) => {
  return (
    <ScrollView horizontal style={{ marginVertical: 10 ,height:50 }}>
      {subCategories.map(sc => (
        
        <TouchableOpacity
          key={sc.id}
          onPress={() => onSelect(sc.id)}
          style={{
            paddingHorizontal: 10,
            justifyContent:'center',
            alignItems:'center',
            borderRadius: 5,
            backgroundColor: selectedSubCat === sc.id ? "#03B5A7" : "#ffffffff",
            marginHorizontal: 10,
          }}
        >
         
          <Text
            style={{
              color: selectedSubCat === sc.id ? "#fff" : "#000",
              fontWeight: "500",
            }}
          >
            {sc.sub_category_name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default SubCategoryList;
