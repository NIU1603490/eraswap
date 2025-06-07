import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente que muestra un overlay para crear un producto o una publicación.
 * @param {boolean} isVisible - Indica si el overlay es visible.
 * @param {function} onClose - Función para cerrar el overlay.
 */


interface PostOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}


const PostOverlay: React.FC<PostOverlayProps> = ({ isVisible, onClose }) => {
  const router = useRouter(); //navegador 

  if (!isVisible) return null;

  const handleCreateProduct = () => {
    onClose();
    router.push('/(tabs)/(prod)/create_product'); // go to create product page
  };

  const handleCreatePost = () => {
    onClose();
    //router.push('//(tabs)/(prod)/create-post'); // go to create post page
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.option} onPress={handleCreateProduct}>
          <Ionicons name="add-circle-outline" size={20} color="#000" />
          <Text style={styles.optionText}>Product</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={handleCreatePost}>
          <Ionicons name="create-outline" size={20} color="#000" />
          <Text style={styles.optionText}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 90, // Ajustado para que aparezca sobre la barra de navegación
    right: '50%', // Centrado horizontalmente
    transform: [{ translateX: 50 }], // Ajusta el centrado
    backgroundColor: 'transparent',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
  },
});

export default PostOverlay;