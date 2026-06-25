import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { storage } from '../lib/firebase';
import { useAuth } from '../store/auth';

type UseImagePickerResult = {
  imageUri: string | null;
  isUploading: boolean;
  pickImage: () => Promise<void>;
  uploadImage: (entryId: string) => Promise<string | null>;
  clearImage: () => void;
};

export function useImagePicker(): UseImagePickerResult {
  const { user } = useAuth();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async (): Promise<void> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;
    setImageUri(result.assets[0].uri);
  };

  const uploadImage = async (entryId: string): Promise<string | null> => {
    if (!imageUri || !user) return null;
    setIsUploading(true);
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const storageRef = ref(storage, `images/${user.uid}/${entryId}`);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (err) {
      console.error('Image upload failed:', err);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    setImageUri(null);
  };

  return { imageUri, isUploading, pickImage, uploadImage, clearImage };
}
