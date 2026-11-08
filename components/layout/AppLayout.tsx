import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { COLORS } from '../theme/theme';

export type AppPage = 'home' | 'diary' | 'profile' | 'skills';

type Props = {
  today: Date;
  activePage: AppPage;
  databaseReady: boolean;
  storageError: string | null;
  onPageChange: (page: AppPage) => void;
  onRetryDatabase: () => void;
  children: ReactNode;
};

const NAV_ITEMS: { page: AppPage; label: string; icon: string }[] = [
  { page: 'home', label: 'KOTI', icon: '⌂' },
  { page: 'diary', label: 'PÄIVÄKIRJA', icon: '▦' },
  { page: 'profile', label: 'PROFIILI', icon: '◇' },
  { page: 'skills', label: 'TAITOPUU', icon: '⌘' },
];

export default function AppLayout({
  today,
  activePage,
  databaseReady,
  storageError,
  onPageChange,
  onRetryDatabase,
  children,
}: Props) {
  if (!databaseReady) {
    return (
      <View style={[styles.app, styles.databaseScreen]}>
        <StatusBar style="light" />
        <BrandMark />
        <Text style={styles.databaseTitle}>
          {storageError ? 'Tallennustilaa ei voitu avata' : 'Ladataan paikallisia tietoja...'}
        </Text>
        {storageError && (
          <>
            <Text style={styles.databaseError}>{storageError}</Text>
            <Pressable style={styles.retryButton} onPress={onRetryDatabase}>
              <Text style={styles.retryButtonText}>Yritä uudelleen</Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  return (
    <View style={styles.app}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <BrandMark />
        <View>
          <Text style={styles.brand}>ANANKE</Text>
          <Text style={styles.brandCaption}>YOUR DAILY QUEST</Text>
        </View>
        <View style={styles.headerDay}>
          <Text style={styles.headerDayText}>
            {today.toLocaleDateString('fi-FI', { day: '2-digit', month: '2-digit' })}
          </Text>
        </View>
      </View>

      {storageError && (
        <View style={styles.storageErrorBanner}>
          <Text style={styles.storageErrorText}>Tallennusvirhe: {storageError}</Text>
        </View>
      )}

      {children}

      <View style={styles.bottomNav}>
        {NAV_ITEMS.map((item) => (
          <Pressable
            key={item.page}
            style={styles.navButton}
            onPress={() => onPageChange(item.page)}
            accessibilityRole="button"
            accessibilityState={{ selected: activePage === item.page }}
          >
            <Text style={[styles.navIcon, activePage === item.page && styles.navSelected]}>
              {item.icon}
            </Text>
            <Text style={[styles.navLabel, activePage === item.page && styles.navSelected]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function BrandMark() {
  return (
    <View style={styles.brandMark}>
      <Text style={styles.brandMarkText}>A</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  databaseScreen: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  databaseTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  databaseError: {
    color: '#F08C82',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
  },
  retryButtonText: {
    color: COLORS.background,
    fontSize: 13,
    fontWeight: '700',
  },
  storageErrorBanner: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    backgroundColor: '#3A211F',
  },
  storageErrorText: {
    color: '#FFC2BA',
    fontSize: 12,
    lineHeight: 17,
  },
  header: {
    height: 74,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    marginRight: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
  },
  brandMarkText: {
    color: COLORS.background,
    fontSize: 21,
    fontWeight: '900',
  },
  brand: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  brandCaption: {
    color: COLORS.muted,
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 3,
  },
  headerDay: {
    marginLeft: 'auto',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  headerDayText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  bottomNav: {
    minHeight: 72,
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: 9,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  navIcon: {
    color: COLORS.muted,
    fontSize: 20,
    lineHeight: 23,
  },
  navLabel: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
  },
  navSelected: {
    color: COLORS.accent,
  },
});
