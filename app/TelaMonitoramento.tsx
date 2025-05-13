import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { db } from './firebaseConfig';
import { ref, get,  onValue } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';
import { useNavigate } from 'react-router-native';
import { useLocation } from 'react-router-native';


const screenWidth = Dimensions.get('window').width;

interface Reading {
  value: number;
  timestamp: string;
}

interface TemperatureReading {
  value: number;
  timestamp: string;
}

interface RpmReading {
  value: number;
  timestamp: string;

}

export default function TelaMonitoramento() {
  const [phValues, setPhValues] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [maxPh, setMaxPh] = useState<number | null>(null);
  const [minPh, setMinPh] = useState<number | null>(null);
  const [currentPh, setCurrentPh] = useState<number | null>(null);

  const [temperatureValues, setTemperatureValues] = useState<number[]>([]);
  const [temperatureLabels, setTemperatureLabels] = useState<string[]>([]);
  const [maxTemp, setMaxTemp] = useState<number | null>(null);
  const [minTemp, setMinTemp] = useState<number | null>(null);
  const [currentTemp, setCurrentTemp] = useState<number | null>(null);

  const [rpmBomba1, setRpmBomba1] = useState<number | null>(null);
  const [rpmBomba2, setRpmBomba2] = useState<number | null>(null);
  const [bombaAguaLigada, setBombaAguaLigada] = useState<boolean | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeScreen, setActiveScreen] = useState(0);
  const [nivelAgua, setNivelAgua] = useState<number | null>(null);


   const navigate = useNavigate(); // Obtém a função de navegação
   const location = useLocation();

  /*useEffect(() => {
    const interval = setInterval(() => {
      reloadData();
    }, 20000);
    return () => clearInterval(interval);
  }, []);*/

  const fetchData = async (path: string) => {
    try {
      const snapshot = await get(ref(db, path));
      const data = snapshot.val();
      return data ? Object.values(data) : [];
    } catch (error) {
      console.error(`Erro ao buscar dados de ${path}:`, error);
      return [];
    }
  };

  const fetchPhData = async () => {
    const data = await fetchData('Projeto/Dados/Ph');
    if (data.length > 0) {
      const values = data.map((reading: any) => reading.value);
      const timestamps = data.map((reading: any) => new Date(reading.timestamp).toLocaleDateString('pt-BR'));
      setPhValues(values);
      setLabels(timestamps);
      setMaxPh(Math.max(...values));
      setMinPh(Math.min(...values));
      setCurrentPh(values[values.length - 1]);
    }
  };

  const formattedLabels = temperatureLabels.map((label, index) =>
  index % 3 === 0 ? label : ''
);


 const fetchTemperatureData = () => {
  const tempRef = ref(db, 'Projeto/Input/Sensores/TempC');

  onValue(tempRef, (snapshot) => {
    const temp = snapshot.val();
    if (typeof temp === 'number') {
      const timestamp = new Date().toISOString();

      setTemperatureValues(prev => [...prev.slice(-9), temp]); // mantém últimos 10
      setTemperatureLabels(prev => [
        ...prev.slice(-9),
        new Date(timestamp).toLocaleDateString('pt-BR'),
      ]);
      setMaxTemp(prev => (prev !== null ? Math.max(prev, temp) : temp));
      setMinTemp(prev => (prev !== null ? Math.min(prev, temp) : temp));
      setCurrentTemp(temp);
    }
  });
};

const resetTemperatureChart = () => {
    setTemperatureValues([]);
    setTemperatureLabels([]);
    setMaxTemp(null);
    setMinTemp(null);
    setCurrentTemp(null);
  };

  const fetchRpmData = async () => {
    const rpm1Data = await fetchData('Projeto/Output/Atuadores/BombaM');
    const rpm2Data = await fetchData('Projeto/Output/Atuadores/Bomba2');
    const statusData = await get(ref(db, 'Projeto/Output/Atuadores/Bomba2'));

    if (rpm1Data.length > 0) setRpmBomba1(rpm1Data[rpm1Data.length - 1].value);
    if (rpm2Data.length > 0) setRpmBomba2(rpm2Data[rpm2Data.length - 1].value);
    setBombaAguaLigada(statusData.val()?.ligada ?? false);
  };

  const reloadData = async () => {
    setLoading(true);
    await Promise.all([fetchPhData(), fetchTemperatureData(), fetchRpmData(), fetchNivelAgua()]);

    setLoading(false);
  };

  const clearChartData = () => {
    setPhValues([]);
    setLabels([]);
    setTemperatureValues([]);
    setTemperatureLabels([]);
  };

  const fetchNivelAgua = async () => {
  const data = await fetchData('Projeto/Input/Sensores/NivelReal');
  if (data.length > 0) {
    const ultimoValor = data[data.length - 1].value;
    setNivelAgua(ultimoValor);
  }
};
  

  useEffect(() => {
    reloadData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monitoramento</Text>
      <View style={styles.underline} />

      <ScrollView
        horizontal
        pagingEnabled
        style={styles.horizontalScroll}
        onScroll={(event) => {
          const pageIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
          setActiveScreen(pageIndex);
        }}
        scrollEventThrottle={200}
        showsHorizontalScrollIndicator={false}
      >
        {/* Tela 1 - pH */}
        <View style={styles.screenContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#32CD32" />
          ) : (
            <View style={styles.contentContainer}>
              <View style={styles.gaugeContainer}>
                <Text style={styles.gaugeLabel}>Valor atual</Text>
                <Text style={styles.gaugeValue}>{currentPh?.toFixed(1) ?? 'N/A'}</Text>
                <Text style={styles.gaugeUnit}>PH</Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>Ph mais alto registrado: {maxPh ?? 'N/A'}</Text>
                <Text style={styles.infoText}>Ph mais baixo registrado: {minPh ?? 'N/A'}</Text>
              </View>

              <View style={styles.chartContainer}>
                <View style={styles.chartTabs}>
                  {['Diário', 'Semanal', 'Mensal', 'Anual'].map((tab, index) => (
                    <TouchableOpacity key={index} style={styles.chartTab}>
                      <Text style={styles.chartTabText}>{tab}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {phValues.length > 0 ? (
                  <LineChart
                    data={{ labels, datasets: [{ data: phValues }] }}
                    width={screenWidth - 80}
                    height={220}
                    chartConfig={{
                      backgroundGradientFrom: '#fff',
                      backgroundGradientTo: '#fff',
                      color: () => '#32CD32',
                      decimalPlaces: 1,
                    }}
                    bezier
                    style={styles.chart}
                  />
                ) : (
                  <Text style={styles.noDataText}>Nenhum dado disponível</Text>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Tela 2 - Temperatura */}
        <View style={styles.screenContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#32CD32" />
          ) : (
            <View style={styles.contentContainer}>
              <View style={styles.gaugeContainer}>
                <Text style={styles.gaugeLabel}>Temperatura atual</Text>
                <Text style={styles.gaugeValue}>{currentTemp?.toFixed(1) ?? 'N/A'}</Text>
                <Text style={styles.gaugeUnit}>°C</Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>Máxima registrada: {maxTemp ?? 'N/A'}°C</Text>
                <Text style={styles.infoText}>Mínima registrada: {minTemp ?? 'N/A'}°C</Text>
              </View>

              <View style={styles.chartContainer}>
                <View style={styles.chartTabs}>
                  {['Diário', 'Semanal', 'Mensal', 'Anual'].map((tab, index) => (
                    <TouchableOpacity key={index} style={styles.chartTab}>
                      <Text style={styles.chartTabText}>{tab}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {temperatureValues.length > 0 ? (
                  <LineChart
                    data={{
                      labels: temperatureLabels,
                      datasets: [{ data: temperatureValues }],
                    }}
                    width={screenWidth - 80}
                    height={220}
                    chartConfig={{
                      backgroundGradientFrom: '#fff',
                      backgroundGradientTo: '#fff',
                      color: () => '#32CD32',
                      decimalPlaces: 1,
                      labels: formattedLabels,


                    }}
                    bezier
                    style={styles.chart}
                    
                  />

                  
                ) : (
                  <Text style={styles.noDataText}>Nenhum dado disponível</Text>
                  


                )}
                
              </View>
            </View>
          )}
        </View>

        {/* Tela 3 - Bombas */}
        <View style={styles.screenContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#32CD32" />
          ) : (
            <View style={styles.contentContainer}>
              <View style={styles.rpmContainer}>
                <Text style={styles.rpmLabel}>RPM Bomba 1</Text>
                <Text style={styles.rpmValue}>{rpmBomba1 ?? 'N/A'} RPM</Text>
              </View>

              <View style={styles.rpmContainer}>
                <Text style={styles.rpmLabel}>RPM Bomba 2</Text>
                <Text style={styles.rpmValue}>{rpmBomba2 ?? 'N/A'} RPM</Text>
              </View>

              <View style={styles.statusContainer}>
                <Text style={styles.statusLabel}>Bomba d'água:</Text>
                <Text style={[styles.statusValue, { color: bombaAguaLigada === true ? 'green' : 'red' }]}>
                  {bombaAguaLigada === true ? 'Ligada' : 'Desligada'}</Text>

              </View>
            </View>
          )}

          
        </View>

          {/* Tela 4 - Nível da Água */}
               <View style={styles.screenContainer}>
  {loading ? (
    <ActivityIndicator size="large" color="#32CD32" />
  ) : (
    <View style={styles.contentContainer}>
      <View style={styles.gaugeContainer}>
        <Text style={styles.gaugeLabel}>Nível da Água</Text>
        <Text style={styles.gaugeValue}>
          {nivelAgua !== null ? `${nivelAgua.toFixed(1)}%` : 'N/A'}
        </Text>
        <Text style={styles.gaugeUnit}>Porcentagem</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Nível atual do Biorreator.
        </Text>
      </View>
    </View>
  )}
</View>

       


        

        

      </ScrollView>

      <TouchableOpacity onPress={reloadData} style={styles.reloadButton}>
         <Ionicons name="refresh" size={24} color="white" />
        <Text style={styles.reloadText}>Recarregar</Text>
          </TouchableOpacity>

          

      <View style={styles.pagination}>
  {[0, 1, 2, 3].map((index) => (
    <Text key={index} style={[styles.dot, activeScreen === index && styles.activeDot]}>•</Text>
  ))}
</View>

      <View style={styles.navBar}>
      <TouchableOpacity 
        style={[styles.navButton, location.pathname === '/monitoramento' && styles.activeButton]} 
        onPress={() => navigate('/monitoramento')}
      >
        <Ionicons name="home" size={24} color={location.pathname === '/monitoramento' ? 'yellow' : 'white'} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.navButton, location.pathname === '/controle' && styles.activeButton]} 
        onPress={() => navigate('/controle')}
      >
        <Ionicons name="settings" size={24} color={location.pathname === '/controle' ? 'yellow' : 'white'} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.navButton, location.pathname === '/graficos' && styles.activeButton]} 
        onPress={() => navigate('/graficos')}
      >
        <Ionicons name="analytics" size={24} color={location.pathname === '/graficos' ? 'yellow' : 'white'} />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.navButton, location.pathname === '/usuario' && styles.activeButton]} 
        onPress={() => navigate('/usuario')}
      >
        <Ionicons name="person" size={24} color={location.pathname === '/usuario' ? 'yellow' : 'white'} />
      </TouchableOpacity>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'left',
    marginTop: '5%',
    paddingLeft: 20,
  },
  underline: {
    height: 3,
    width: '40%',
    backgroundColor: 'green',
    marginVertical: 8,
    marginLeft: 20,
  },
  horizontalScroll: {
    flex: 1,
  },
  screenContainer: {
    width: screenWidth,
    padding: 20,
  },
  contentContainer: {
    flex: 1,
  },
  gaugeContainer: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 20,
    shadowColor: '#000', // Cor da sombra (preto)
    shadowOpacity: 0.2, // Transparência da sombra
    shadowRadius: 5, // Suavidade da sombra
    shadowOffset: { width: 0, height: 2 }, // Posição da sombra
    elevation: 5, // Sombras para Android
  },
  gaugeLabel: {
    fontSize: 14,
    color: '#555',
  },
  gaugeValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'green',
  },
  gaugeUnit: {
    fontSize: 20,
    color: '#000',
  },
  infoBox: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000', // Cor da sombra (preto)
    shadowOpacity: 0.2, // Transparência da sombra
    shadowRadius: 5, // Suavidade da sombra
    shadowOffset: { width: 0, height: 2 }, // Posição da sombra
    elevation: 5, // Sombras para Android
  },
  infoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '',
    textAlign: 'center',
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
    borderTopStartRadius: 8
    
  },
  navButton: {
    padding: 10,
    borderRadius: 10,
  },
  activeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Destaque sutil para o botão ativo
    borderRadius: 5,
  },
  chartContainer: {
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 10,
    shadowColor: '#000', // Cor da sombra (preto)
    shadowOpacity: 0.2, // Transparência da sombra
    shadowRadius: 5, // Suavidade da sombra
    shadowOffset: { width: 0, height: 2 }, // Posição da sombra
    elevation: 5, // Sombras para Android
  },
  chartTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  chartTab: {
    padding: 8,
    backgroundColor: 'green',
    borderRadius: 5,
  },
  chartTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  chart: {
    borderRadius: 10,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
    marginBottom: 80,
  },
  dot: {
    fontSize: 20,
    color: '#bbb',
    marginHorizontal: 5,
  },
  activeDot: {
    color: 'green',
  },

  rpmText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'green',
    marginTop: -50,
  },

  rpmContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000', // Cor da sombra (preto)
    shadowOpacity: 0.2, // Transparência da sombra
    shadowRadius: 5, // Suavidade da sombra
    shadowOffset: { width: 0, height: 2 }, // Posição da sombra
    elevation: 5, // Sombras para Android
  },
  rpmLabel: {
    fontSize: 18,
    color: '#555',
  },
  rpmValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'green',
  },

  statusContainer: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff', // Corrigido para branco puro
    borderRadius: 10,
    marginBottom: 20,
    marginTop: '10%',
    shadowColor: '#000', // Cor da sombra (preto)
    shadowOpacity: 0.2, // Transparência da sombra
    shadowRadius: 5, // Suavidade da sombra
    shadowOffset: { width: 0, height: 2 }, // Posição da sombra
    elevation: 5, // Sombras para Android
  },

  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  reloadButton: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    backgroundColor: 'green',
    padding: 8,
    marginRight: 10,
    marginTop: 10,
    borderRadius: 16,
    alignItems: 'center',
    marginLeft: '22%',
    
  },
  reloadText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },

  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2E7D32',
    paddingVertical: 15,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopEndRadius: 8,
    borderTopStartRadius: 8,
  },
  navButton: {
    padding: 10,
  },
  activeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
  },
  


});
