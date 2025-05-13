import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { db } from './firebaseConfig';
import { ref, get, onValue } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';
import { useNavigate, useLocation } from 'react-router-native';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  color: (opacity = 1) => `rgba(0, 100, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 80, 0, ${opacity})`,
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#006400',
  },
  propsForBackgroundLines: {
    stroke: '#a0d6a0',
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

  const reloadData = async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
  };

  const clearChartData = () => {
    setPhData([]);
    setTempData([]);
    setRpm1Data([]);
    setRpm2Data([]);
    setLabels([]);
  };

  const fetchData = () => {
  const projetoRef = ref(db, 'Projeto');

  onValue(projetoRef, (snapshot) => {
    const projetoData = snapshot.val();
    const sensores = projetoData?.Input?.Sensores || {};
    const dados = projetoData?.Output?.Dados || {};

    const temperatura = sensores.TempC ?? 0;
    const distancia = sensores.Distancia ?? 0;
    const nivel = sensores.NivelReal ?? 0;
    const volume = sensores.Volume ?? 0;

    const velocidade = dados.Velocidade ?? 0;
    const temperaturaOut = dados.Temperatura ?? 0;

    const now = new Date();
    const label = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}`;

    // Mantém últimos 10 pontos
    setTempData(prev => [...prev.slice(-9), temperatura]);
    setPhData(prev => [...prev.slice(-9), Number(temperaturaOut)]);
    setRpm1Data(prev => [...prev.slice(-9), Number(velocidade)]);
    setRpm2Data(prev => [...prev.slice(-9), Number(volume)]);
    setLabels(prev => [...prev.slice(-9), label]);

    setLoading(false);
  });
};
  useEffect(() => {
  fetchData();
}, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.text}>Análise de Dados</Text>
         <View style={styles.underline} />

        {loading ? (
          <ActivityIndicator size="large" color="green" />
        ) : (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {/* Página 1 */}
            <View style={styles.page}>
              <Text style={styles.chartTitle}>Temperatura Atual (TempC)</Text>
              <View style={styles.card}>
                <BarChart
                  data={{ labels, datasets: [{ data: tempData }] }}
                  width={screenWidth - 72}
                  height={220}
                  chartConfig={chartConfig}
                  style={styles.chart}
                />
              </View>

              <Text style={styles.chartTitle}>Ph</Text>
              <View style={styles.card}>
                <LineChart
                  data={{ labels, datasets: [{ data: phData }] }}
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
              <Text style={styles.chartTitle}>Velocidade da Bomba (RPM)</Text>
              <View style={styles.card}>
                <LineChart
                  data={{ labels, datasets: [{ data: rpm1Data }] }}
                  width={screenWidth - 72}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              </View>

              <Text style={styles.chartTitle}>Volume Estimado</Text>
              <View style={styles.card}>
                <LineChart
                  data={{ labels, datasets: [{ data: rpm2Data }] }}
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

      {/* Botões de ação */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
        <TouchableOpacity onPress={reloadData} style={styles.reloadButton}>
          <Ionicons name="refresh" size={20} color="white" />
          <Text style={styles.reloadText}>Recarregar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={clearChartData} style={[styles.reloadButton, { backgroundColor: '#888' }]}>
          <Ionicons name="close-circle" size={20} color="white" />
          <Text style={styles.reloadText}>Limpar</Text>
        </TouchableOpacity>
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
    
    backgroundColor: '#fff',
    paddingBottom: 70,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'left',
    marginTop: '5%',
    paddingLeft: 20,
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
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'green',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reloadText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: 'bold',
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
},
  underline: {
    height: 3,
    width: '45%',
    backgroundColor: 'green',
    marginVertical: 8,
    marginLeft: 20,
    marginTop: 5
  },
})
