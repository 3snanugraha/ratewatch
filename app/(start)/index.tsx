import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    image: require('@/assets/images/interest_rate.png'),
    description: 'Keep an eye on global interest rates at a glance.',
  },
  {
    id: '2',
    image: require('@/assets/images/probabilities.png'),
    description: 'Anticipate changes with probability metrics.',
  },
  {
    id: '3',
    image: require('@/assets/images/analysis.png'),
    description: 'Get detailed analytics and forecasts.',
  },
];

export default function StartScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleGetStarted = () => {
    router.push('/(tabs)');
  };

  const renderItem = ({ item }: { item: typeof slides[0] }) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.image} />
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#7E57C2', '#4A148C']}
        start={{ x: 0.0, y: 0.0 }}
        end={{ x: 1.0, y: 1.0 }}
        style={styles.gradientBackground}
      />
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to RateWatch</Text>
        <MaterialCommunityIcons name="chart-areaspline" size={48} color="#FFF" />
      </View>
      <FlatList
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        style={styles.slider}
      />
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index && styles.activeDot,
            ]}
          />
        ))}
      </View>
      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <MaterialCommunityIcons name="chevron-right-circle" size={24} color="#FFF" />
        <Text style={styles.buttonText}>Start Exploring</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E003E',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    marginTop: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 10,
  },
  slider: {
    flexGrow: 0,
    marginTop: 20,
    marginBottom: 30,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    height: height * 0.3,
    width: width * 0.8,
    resizeMode: 'contain',
    borderRadius: 20,
    marginBottom: 20,
    borderColor: '#FFF',
    borderWidth: 2,
  },
  description: {
    fontSize: 18,
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginHorizontal: 30,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#B39DDB',
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: '#FFF',
    width: 14,
    height: 14,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#5E35B1',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  buttonText: {
    color: '#FFF',
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 18,
    textTransform: 'uppercase',
  },
});
