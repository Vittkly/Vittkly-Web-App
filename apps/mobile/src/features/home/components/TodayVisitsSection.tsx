import React from 'react';
import { View, Text } from 'react-native';

import { WorkOrderCard } from '@/components/WorkOrderCard';
import { useTheme } from '@/theme';

export function TodayVisitsSection() {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={{ gap: spacing.space3 }}>
      <Text style={[typography.title2, { color: colors.ink }]}>Visitas de hoy</Text>

      <WorkOrderCard
        code="OT-0482"
        title="Limpieza de oficina · Miraflores"
        status="en-ruta"
        address="Av. Larco 1150, piso 4"
        time="9:40 a. m."
        technician="Rosa M."
        amount="S/ 150.00"
        onPress={() => {}}
      />

      <WorkOrderCard
        code="OT-0481"
        title="Mantenimiento de aire acondicionado"
        status="completada"
        address="Ca. Los Pinos 320, San Isidro"
        time="8:00 a. m."
        technician="Rosa M."
        amount="S/ 280.00"
      />

      <WorkOrderCard
        code="OT-0479"
        title="Desinfección integral de almacén"
        status="pagada"
        address="Av. Argentina 2410, Callao"
        time="Ayer · 4:30 p. m."
        amount="S/ 420.00"
      />
    </View>
  );
}
