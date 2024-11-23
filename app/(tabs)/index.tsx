import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  Text, 
  ActivityIndicator, 
  RefreshControl,
  Animated,
  Dimensions,
  TouchableOpacity 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AuthManager from '@/services/Auth';


const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Update interfaces to match the collection schema
interface InterestRate {
  id: string;
  country_region: string;
  central_bank: string;
  current_rate: number;
  direction: 'up' | 'down' | 'neutral';
  previous_rate: number;
  change_date: string;
}

interface InterestRateProbability {
  id: string;
  central_bank: {
    id: string;
    country_region: string;
    central_bank: string;
    current_rate: string;
    direction: string;
    previous_rate: string;
    change_date: string;
  };
  current_rate: string;
  next_meeting_date: string;
  next_expected_move: 'cut' | 'hike' | 'nochange';
  change_by: string;
  probability_of_change: string;
  probability_of_no_change: string;
}

const { width } = Dimensions.get('window');

export default function InterestRatesScreen() {
  const [groupedData, setGroupedData] = useState<{
    [centralBank: string]: {
      rates: InterestRate[];
      probabilities: InterestRateProbability[];
    }
  }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0)); // Pindah ke useState

  const fetchRates = async () => {
    setLoading(true); // Pastikan ini di awal
    // console.log('Starting fetch...');
    try {
      const authManager = AuthManager;
  
      // Fetch interest rates with proper typing
      const rateRecords = await authManager.fetchCollection('interest_rates');
      const formattedRates: InterestRate[] = rateRecords.map((rate: any) => ({
        id: rate.id,
        country_region: rate.country_region || 'Unknown',
        central_bank: rate.central_bank || 'Unknown',
        current_rate: parseFloat(rate.current_rate) || 0,
        direction: rate.direction || 'neutral',
        previous_rate: parseFloat(rate.previous_rate) || 0,
        change_date: formatDate(rate.change_date),
      }));
  
      // Fetch interest rate probabilities with expanded central_bank relation
      const probabilityRecords = await authManager.fetchCollection('interest_rate_probabilities', {
        expand: 'central_bank',
        // You might want to add sorting or filtering here
        sort: '-next_meeting_date'
      });
      
      const formattedProbabilities: InterestRateProbability[] = probabilityRecords.map((prob: any) => {
        // Ensure we have the expanded central_bank data
        if (!prob.expand?.central_bank) {
          console.warn(`Missing expanded central_bank data for probability record ${prob.id}`);
        }

        return {
          id: prob.id,
          central_bank: prob.expand?.central_bank || {
            id: '',
            country_region: 'Unknown',
            central_bank: prob.central_bank || 'Unknown',
            current_rate: '0',
            direction: 'neutral',
            previous_rate: '0',
            change_date: '',
          },
          current_rate: prob.current_rate || 'N/A',
          next_meeting_date: formatDate(prob.next_meeting_date),
          next_expected_move: prob.next_expected_move || 'nochange',
          change_by: prob.change_by || 'N/A',
          probability_of_change: prob.probability_of_change || '0',
          probability_of_no_change: prob.probability_of_no_change || '0',
        };
      });
  
      // Simpan data ke variable terlebih dahulu
      const groupedDataResult = groupDataByCentralBank(formattedRates, formattedProbabilities);
      // console.log('About to set grouped data:', groupedDataResult);

      
      
      // Set state dan tunggu sampai selesai
      await new Promise(resolve => {
        setGroupedData(groupedDataResult);
        setTimeout(resolve, 0);
      });
      // Setelah state ter-update, baru jalankan animasi
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const formattedDate = new Date(dateString);
    return formattedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const groupDataByCentralBank = (
    rates: InterestRate[], 
    probabilities: InterestRateProbability[]
  ) => {
    // console.log('Grouping data with:', { rates, probabilities }); 
    
    const grouped = rates.reduce((acc, rate) => {
      const centralBank = rate.central_bank;
      // console.log('Processing rate for:', centralBank); 
      
      if (!acc[centralBank]) {
        acc[centralBank] = {
          rates: [],
          probabilities: []
        };
      }
  
      acc[centralBank].rates.push(rate);
      return acc;
    }, {} as {[centralBank: string]: {rates: InterestRate[], probabilities: InterestRateProbability[]}});
  
    // Process probabilities
    probabilities.forEach(prob => {
      const centralBankName = prob.central_bank.central_bank;
      // console.log('Processing probability for:', centralBankName); 
      
      if (!grouped[centralBankName]) {
        grouped[centralBankName] = {
          rates: [],
          probabilities: []
        };
      }
      
      grouped[centralBankName].probabilities.push(prob);
    });
  
    // console.log('Final grouped data:', grouped); 
    return grouped;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
  
        // Fetch Rates
        const rates = await AuthManager.fetchCollection('interest_rates');
        const formattedRates = rates.map((rate) => ({
          id: rate.id,
          country_region: rate.country_region || 'Unknown',
          central_bank: rate.central_bank || 'Unknown',
          current_rate: parseFloat(rate.current_rate) || 0,
          direction: rate.direction || 'neutral',
          previous_rate: parseFloat(rate.previous_rate) || 0,
          change_date: formatDate(rate.change_date),
        }));
  
        // Fetch Probabilities
        const probabilities = await AuthManager.fetchCollection('interest_rate_probabilities', {
          expand: 'central_bank',
        });
        const formattedProbabilities = probabilities.map((prob) => {
          const cbData = prob.expand?.central_bank || {};
          return {
            id: prob.id,
            central_bank: {
              id: cbData.id || '',
              country_region: cbData.country_region || 'Unknown',
              central_bank: cbData.central_bank || prob.central_bank,
              current_rate: cbData.current_rate || '0',
              direction: cbData.direction || 'neutral',
              previous_rate: cbData.previous_rate || '0',
              change_date: cbData.change_date || '',
            },
            current_rate: prob.current_rate || 'N/A',
            next_meeting_date: formatDate(prob.next_meeting_date),
            next_expected_move: prob.next_expected_move || 'nochange',
            change_by: prob.change_by || 'N/A',
            probability_of_change: prob.probability_of_change || '0',
            probability_of_no_change: prob.probability_of_no_change || '0',
          };
        });
  
        // Grouping Data
        const groupedDataResult = groupDataByCentralBank(formattedRates, formattedProbabilities);
        if (Object.keys(groupedDataResult).length > 0) {
          setGroupedData(groupedDataResult);
  
          // Trigger Fade-in Animation
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }).start();
        } else {
          setGroupedData({});
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
  
    fetchData();
  }, []);
  

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchRates();
  }, []);

  const toggleSection = (centralBank: string) => {
    setExpandedSection(expandedSection === centralBank ? null : centralBank);
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction.toLowerCase()) {
      case 'up':
        return <MaterialCommunityIcons name="arrow-up-bold" size={24} color="#4CAF50" />;
      case 'down':
        return <MaterialCommunityIcons name="arrow-down-bold" size={24} color="#F44336" />;
      default:
        return <MaterialCommunityIcons name="minus" size={24} color="#FFF" />;
    }
  };

  const calculateMeterWidth = (percentage: string): number => {
    // Convert string percentage to number and calculate relative width
    const containerWidth = width - 40; // Accounting for padding/margins
    return (parseFloat(percentage) / 100) * containerWidth;
  };

  const renderRateCard = (rate: InterestRate) => (
    <View style={styles.probabilityCard}>
      <View style={styles.probabilityHeader}>
        <MaterialCommunityIcons name="chart-areaspline" size={24} color="#FFF" />
        <Text style={styles.probabilityTitle}>Interest Rate</Text>
      </View>
      
      <View style={styles.probabilityContent}>
        <View style={styles.probabilityItem}>
          <Text style={styles.probabilityLabel}>Country/Region:</Text>
          <Text style={styles.probabilityValue}>{rate.country_region}</Text>
        </View>
        <View style={styles.probabilityItem}>
          <Text style={styles.probabilityLabel}>Current:</Text>
          <Text style={styles.probabilityValue}>{rate.current_rate}%</Text>
        </View>
        <View style={styles.probabilityItem}>
          <Text style={styles.probabilityLabel}>Direction:</Text>
          <Text style={styles.probabilityValue}>{getDirectionIcon(rate.direction)}</Text>
        </View>

        <View style={styles.probabilityItem}>
          <Text style={styles.probabilityLabel}>Previous:</Text>
          <Text style={styles.probabilityValue}>{rate.previous_rate}%</Text>
        </View>

        <View style={styles.probabilityItem}>
          <Text style={styles.probabilityLabel}>Date:</Text>
          <Text style={styles.probabilityValue}>{rate.change_date}</Text>
        </View>
      </View>

    </View>
  );

  const renderProbabilityCard = (prob: InterestRateProbability) => (
    <View style={styles.probabilityCard}>
      <View style={styles.probabilityHeader}>
        <MaterialCommunityIcons name="brightness-percent" size={24} color="#FFF" />
        <Text style={styles.probabilityTitle}>Interest Rate Probability</Text>
      </View>
      
      <View style={styles.probabilityContent}>
        <View style={styles.probabilityItem}>
          <Text style={styles.probabilityLabel}>Current Rate:</Text>
          <Text style={styles.probabilityValue}>{prob.current_rate}%</Text>
        </View>

        <View style={styles.probabilityItem}>
          <Text style={styles.probabilityLabel}>Date:</Text>
          <Text style={styles.probabilityValue}>{prob.next_meeting_date}</Text>
        </View>
        
        <View style={styles.probabilityItem}>
          <Text style={styles.probabilityLabel}>Expected Move:</Text>
          <Text style={[
            styles.probabilityValue,
            { color: prob.next_expected_move === 'cut' ? '#F44336' : 
                     prob.next_expected_move === 'hike' ? '#4CAF50' : '#FFF' }
          ]}>
            {prob.next_expected_move.toUpperCase()}
          </Text>
        </View>

        <View style={styles.probabilityItem}>
          <Text style={styles.probabilityLabel}>Change by:</Text>
          <Text style={styles.probabilityValue}>{prob.change_by} bps</Text>
        </View>

        <View style={styles.probabilityMeters}>
          <View style={styles.probabilityMeter}>
            <Text style={styles.meterLabel}>Change Probability</Text>
            <View style={styles.meterContainer}>
              <Animated.View 
                style={[
                  styles.meterFill,
                  {
                    width: calculateMeterWidth(prob.probability_of_change)
                  }
                ]} 
              />
              <Text style={styles.meterText}>{prob.probability_of_change}%</Text>
            </View>
          </View>

          <View style={styles.probabilityMeter}>
            <Text style={styles.meterLabel}>No Change Probability</Text>
            <View style={styles.meterContainer}>
              <Animated.View 
                style={[
                  styles.meterFill,
                  {
                    width: calculateMeterWidth(prob.probability_of_no_change),
                    backgroundColor: '#9575CD'
                  }
                ]} 
              />
              <Text style={styles.meterText}>{prob.probability_of_no_change}%</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderCentralBankSection = (centralBank: string, data: {rates: InterestRate[], probabilities: InterestRateProbability[]}) => {
    // console.log('Rendering section for:', centralBank, 'with data:', data);
    
    if (!data || (!data.rates.length && !data.probabilities.length)) {
      return null;
    }
  
    return (
      <Animated.View 
        key={centralBank} 
        style={[
          styles.centralBankSection, 
          { 
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })
            }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => toggleSection(centralBank)}
        >
          <View style={styles.headerContent}>
            <MaterialCommunityIcons 
              name="bank" 
              size={32} 
              color="#FFF" 
              style={styles.bankIcon}
            />
            <Text style={styles.centralBankTitle}>{centralBank}</Text>
          </View>
          <MaterialCommunityIcons 
            name={expandedSection === centralBank ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#FFF" 
          />
        </TouchableOpacity>
        
        {expandedSection === centralBank && (
          <View style={styles.sectionContent}>
            {data.rates.map((rate, index) => (
              <View key={`rate-${rate.id}-${index}`}>
                {renderRateCard(rate)}
              </View>
            ))}
  
            {data.probabilities.map((prob, index) => (
              <View key={`prob-${prob.id}-${index}`}>
                {renderProbabilityCard(prob)}
              </View>
            ))}
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4A148C', '#7E57C2']}
        start={{ x: 0.0, y: 0.0 }}
        end={{ x: 1.0, y: 1.0 }}
        style={styles.gradientBackground}
      />
      
      <View style={styles.header}>
        <MaterialCommunityIcons name="chart-line-variant" size={48} color="#FFF" />
        <Text style={styles.title}>RateWatch</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>Loading market data...</Text>
        </View>
      ) : Object.keys(groupedData).length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={['#7E57C2']}
              tintColor="#FFF"
            />
          }
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          {Object.entries(groupedData).map(([centralBank, data]) => (
            <React.Fragment key={centralBank}>
              {renderCentralBankSection(centralBank, data)}
            </React.Fragment>
          ))}
        </ScrollView>


      )}
    </View>
  );
}

// Complete the styles object with enhanced styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A148C',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 15,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 10,
    fontSize: 16,
  },
  centralBankSection: {
    margin: 10,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centralBankTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 10,
  },
  sectionContent: {
    padding: 10,
  },
  rateCard: {
    borderRadius: 10,
    marginBottom: 10,
    padding: 2,
  },
  rateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  countryRegion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  rateContent: {
    gap: 8,
  },
  rateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateLabel: {
    fontSize: 16,
    color: '#CCC',
  },
  rateValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  changeDate: {
    fontSize: 14,
    color: '#BBB',
    marginTop: 5,
  },
  probabilityCard: {
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  probabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  probabilityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 10,
  },
  probabilityContent: {
    padding: 15,
  },
  probabilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  probabilityLabel: {
    fontSize: 16,
    color: '#CCC',
  },
  probabilityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  probabilityMeters: {
    marginTop: 15,
  },
  probabilityMeter: {
    marginBottom: 12,
  },
  meterLabel: {
    fontSize: 14,
    color: '#CCC',
    marginBottom: 5,
  },
  meterContainer: {
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    width: '100%', // Make sure container takes full width
  },
  meterFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    // width will be set dynamically
  },
  meterText: {
    position: 'absolute',
    right: 10,
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 20,
    zIndex: 1, // Ensure text stays on top
  },
  bankIcon: {
    marginRight: 10,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  noDataText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
  },
  refreshButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  refreshButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});