import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartProps {
  cartItems: CartItem[];
  setCartItems: (items: CartItem[]) => void;
}

const Cart: React.FC<CartProps> = ({ cartItems, setCartItems }) => { // Tạo component Cart
  const [modalVisible, setModalVisible] = useState(false);

  // Hàm cập nhật số lượng mặt hàng
  const updateItemQuantity = (id: number, increase: boolean) => { 
    setCartItems((prevItems) => {
      return prevItems.map((item) =>
        item.id === id
          ? { ...item, quantity: increase ? item.quantity + 1 : Math.max(item.quantity - 1, 1) }
          : item
      );
    });
  };

  const removeItem = (id: number) => { // Hàm xóa mặt hàng khỏi giỏ hàng
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const clearCart = () => setCartItems([]);

  const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

  return ( // return để hiển thị giỏ hàng 
    <View>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Ionicons name="cart-outline" size={30} color="black" />
        <Text>{cartItems.length}</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={cartItems}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.cartItem}>
                  <Image source={{ uri: item.image }} style={styles.cartItemImage} /> //
                  <View style={styles.cartItemDetails}>
                    <Text style={styles.cartItemTitle}>{item.title}</Text>
                    <Text style={styles.cartItemPrice}>${item.price.toFixed(2)}</Text>
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity onPress={() => updateItemQuantity(item.id, false)}>
                        <Ionicons name="remove-circle-outline" size={24} color="black" />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity onPress={() => updateItemQuantity(item.id, true)}>
                        <Ionicons name="add-circle-outline" size={24} color="black" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => removeItem(item.id)}>
                    <Ionicons name="trash-outline" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              )}
            />
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total: ${totalAmount}</Text>
            </View>
            <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
              <Text style={styles.clearButtonText}>Clear Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  cartItemImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 5,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#888',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  totalContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default Cart;