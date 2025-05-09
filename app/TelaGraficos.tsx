import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { db } from './firebaseConfig';
import { ref, get } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';
import { useNavigate, useLocation } from 'react-router-native';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  color: (opacity = 1) => `rgba(0, 100, 0, ${opacity})`, // verde escuro para elementos do gráfico
  labelColor: (opacity = 1) => `rgba(0, 80, 0, ${opacity})`, // ainda mais escuro para os rótulos
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#006400', // verde escuro (hex)
  },
  propsForBackgroundLines: {
    stroke: '#a0d6a0', // verde claro mais discreto
  },
};

export default function TelaGraficos() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [phData, setPhData] = useState<number[]>([]);
  const [tempData, setTempData] = useState<number[]>([]);
  const [rpm1Data, setRpm1Data] = useState<number[]>([]);
  const [rpm2Data, setRpm2Data] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await get(ref(db));
        const data = snapshot.val();
  
        const extractValues = (obj: any) =>
          obj
            ? Object.values(obj)
                .filter((item: any) => item?.value !== undefined)
                .map((item: any) => ({ value: item.value, timestamp: item.timestamp }))
            : [];
  
        const ph = extractValues(data.phReadings);
        const temp = extractValues(data.temperatureReadings);
        const rpm1 = extractValues(data.rpmBomba1Readings);
        const rpm2 = extractValues(data.rpmBomba2Readings);
  
        setPhData(ph.map((d: any) => d.value));
        setTempData(temp.map((d: any) => d.value));
        setRpm1Data(rpm1.map((d: any) => d.value / 100));
        setRpm2Data(rpm2.map((d: any) => d.value / 100));
  
        // Datas abreviadas e alternadas
        const formattedLabels = ph.map((d: any) => {
          const date = new Date(d.timestamp);
          return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        });
  
        // Mostra um rótulo a cada dois
        const reducedLabels = formattedLabels.map((label, index) => (index % 2 === 0 ? label : ''));
  
        setLabels(reducedLabels);
      } catch (error) {
        console.error('Erro ao buscar dados do Firebase:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.text}>Análise de Dados</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {/* Página 1 */}
            <View style={styles.page}>
              <Text style={styles.chartTitle}>Histórico de pH</Text>
              <View style={styles.card}>
                <BarChart
                  data={{ labels: labels.slice(-6), datasets: [{ data: phData.slice(-6) }] }}
                  width={screenWidth - 72}
                  height={220}
                  chartConfig={chartConfig}
                  style={styles.chart}
                />
              </View>

              <Text style={styles.chartTitle}>Temperatura</Text>
              <View style={styles.card}>
                <LineChart
                  data={{ labels: labels.slice(-6), datasets: [{ data: tempData.slice(-6) }] }}
                  width={screenWidth - 72}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              </View>
            </View>

            {/* Página 2 */}
            <View style={styles.page}>
              <Text style={styles.chartTitle}>RPM Bomba 1</Text>
              <View style={styles.card}>
                <LineChart
                  data={{ labels: labels.slice(-6), datasets: [{ data: rpm1Data.slice(-6) }] }}
                  width={screenWidth - 72}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              </View>

              <Text style={styles.chartTitle}>RPM Bomba 2</Text>
              <View style={styles.card}>
                <LineChart
                  data={{ labels: labels.slice(-6), datasets: [{ data: rpm2Data.slice(-6) }] }}
                  width={screenWidth - 72}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Barra de Navegação */}
      <View style={styles.navBar}>
        {[
          { path: '/monitoramento', icon: 'home' },
          { path: '/controle', icon: 'settings' },
          { path: '/graficos', icon: 'analytics' },
          { path: '/usuario', icon: 'person' },
        ].map((item) => (
          <TouchableOpacity
            key={item.path}
            style={[styles.navButton, location.pathname === item.path && styles.activeButton]}
            onPress={() => navigate(item.path)}
          >
            <Ionicons name={item.icon} size={24} color={location.pathname === item.path ? 'yellow' : 'white'} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingBottom: 70,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  page: {
    width: Dimensions.get('window').width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
    color: '#333',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
  card: {
    backgroundColor: '#ffff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    width: screenWidth - 40,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'green',
    paddingVertical: 15,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopEndRadius: 8,
    borderTopStartRadius: 8,
  },
  navButton: {
    padding: 10,
    borderRadius: 10,
  },
  activeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
  },
});