import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '@/services/types';
import { Heart } from "lucide-react-native";

interface Props {
  post: Post;
  onLikePress: (postId: string, liked: boolean) => void;
  onProfilePress: (userId: string) => void;
}

const formatTime = (timestamp: Date) => {
  console.log(timestamp)
  const date = new Date(timestamp);
  const now = new Date(); 
  
  // if is today, show only the hour
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // if its this week the day
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }
  
  //if is this year only the year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
  }
  
  // if its other year, showe only month and year
  return date.toLocaleDateString([], { day: 'numeric', month: 'numeric', year: 'numeric' });

}

const PostCard = memo(({ post, onLikePress, onProfilePress }: Props) => (

  
  
  <View style={styles.postCard}>
    <TouchableOpacity style={styles.authorSection} onPress={() => onProfilePress(post.author._id)}>
      <Image source={{ uri: post.author.profilePicture }} style={styles.authorAvatar} />
      <View>
        <Text style={styles.authorName}>{post.author.username}</Text>
        <Text style={styles.postTimestamp}>{formatTime(post.createdAt)}</Text>
      </View>
    </TouchableOpacity>

    <Text style={styles.postText}>{post.content}</Text>

    {post.images && post.images.length > 0 && (
      <FlatList
        data={post.images}
        horizontal
        keyExtractor={(img, index) => `${post._id}-img-${index}`}
        renderItem={({ item }) => <Image source={{ uri: item }} style={styles.postImage} />}
        style={styles.postImagesContainer}
        showsHorizontalScrollIndicator={false}
      />
    )}

     <View style={styles.actionsSection}>
      <TouchableOpacity style={styles.actionButton} >
        <Heart 
        size={20}
        color="#6B7280"
        />
      </TouchableOpacity>
      {/*
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => onLikePress(post._id, !!post.isLikedByUser)}
      >
        <Ionicons
          name={post.isLikedByUser ? 'heart' : 'heart-outline'}
          size={22}
          color={post.isLikedByUser ? '#E91E63' : '#6B7280'}
        />
        <Text style={styles.actionText}>{post.likes}</Text>
      </TouchableOpacity> */}
      {/* <TouchableOpacity style={styles.actionButton} onPress={() => onPostDetailPress(post._id)}>
        <Ionicons name="chatbubble-outline" size={22} color="#6B7280" />
        <Text style={styles.actionText}>{post.comments.length}</Text>
      </TouchableOpacity> */}
    </View>

    {/* {post.comments.length > 0 && (
      <View style={styles.commentsPreviewSection}>
        <TouchableOpacity onPress={() => onPostDetailPress(post._id)}>
          <Text style={styles.viewAllCommentsText}>
            View all {post.comments.length} comments
          </Text>
        </TouchableOpacity>
      </View>
    )} */}
  </View>
));

export default PostCard;

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 15,
    padding: 15,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  authorSection: { 
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  authorAvatar: { 
    width: 30,
    height: 30,
    borderRadius: 20,
    marginRight: 12
  },
  authorName: {
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  postTimestamp: { 
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'PlusJakartaSans-Regular'
  },
  postText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  postImagesContainer: { marginBottom: 12 },
  postImage: {
    width: 300,
    height: 200,
    borderRadius: 8,
    marginRight: 10,
    resizeMode: 'cover',
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: { 
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: { marginLeft: 8, fontSize: 14, color: '#6B7280', fontFamily: 'PlusJakartaSans-Regular' },
  commentsPreviewSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  viewAllCommentsText: {
    fontSize: 14,
    color: '#3D5AF1',
    fontWeight: '500',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});