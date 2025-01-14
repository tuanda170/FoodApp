import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortPrice: () => void; // Hàm sắp xếp giá
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery, sortPrice }) => {
  const [isAscending, setIsAscending] = useState(true);

  const handleSortPress = () => {
    // Kiểm tra xem giá đang được sắp xếp theo chiều tăng dần hay giảm dần
    setIsAscending(!isAscending);
    // Gọi hàm sắp xếp
    sortPrice();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={24} color="#666" />
        <TextInput
          style={styles.input}
          placeholder="Searching ..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <TouchableOpacity style={styles.sortButton} onPress={handleSortPress}>
        <Ionicons
          name={isAscending ? 'arrow-up-outline' : 'arrow-down-outline'} // Change icon based on state
          size={24}
          color="#fff"
        />
        <Text style={styles.sortText}>Sort</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    flex: 1,
    marginRight: 10,
    height: 50,
  },
  input: {
    marginLeft: 10,
    fontSize: 18,
    flex: 1,
  },
  sortButton: {
    backgroundColor: '#ff8c00',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default SearchBar;
