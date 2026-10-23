import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { WorkOrderCard } from '@/components/WorkOrderCard';
import { useTodayVisits } from '../hooks/useTodayVisits';
import { useTheme } from '@/theme';

export function TodayVisitsSection() {
  const { colors, spacing, typography } = useTheme();
  const { data: visits = [], isLoading } = useTodayVisits();

  return (
    <View style={{ gap: spacing.space3 }}>
      <Text style={[typography.title2, { color: colors.ink }]}>Visitas de hoy</Text>

      {isLoading ? (
        <View style={{ paddingVertical: spacing.space4, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : visits.length === 0 ? (
        <View
          style={{
            padding: spacing.space4,
            borderRadius: 8,
            backgroundColor: colors.surfaceSunken,
            alignItems: 'center',
          }}
        >
          <Text style={[typography.small, { color: colors.inkMuted }]}>
            No tienes visitas programadas para hoy con esta empresa.
          </Text>
        </View>
      ) : (
        visits.map(visit => (
          <WorkOrderCard
            key={visit.code}
            code={visit.code}
            title={visit.title}
            status={visit.status}
            address={visit.address}
            time={visit.time}
            technician={visit.technician}
            amount={visit.amount}
            onPress={() => {}}
          />
        ))
      )}
    </View>
  );
}
