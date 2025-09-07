// IconDropdown Component - İkon seçimi için dropdown
import React, { useState, useRef, useMemo } from 'react';
import {
  StyleSheet,
  Modal,
  FlatList,
  Dimensions,
  View as RNView,
} from 'react-native';
import { View, Text, TouchableOpacity } from '@/components';
import { useTheme } from '@/contexts';

export interface IconOption {
  value: string;
  emoji: string;
  name: string;
}

interface IconDropdownProps {
  options: IconOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: any;
}

const SCREEN = Dimensions.get('window');
const SIDE_MARGIN = 8;
const ITEM_HEIGHT = 60;
const MAX_LIST_HEIGHT = 300;

const withAlpha = (hex: string, alpha: number) => {
  const a = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, '0');
  return hex.length === 7 ? `${hex}${a}` : hex;
};

const IconDropdown: React.FC<IconDropdownProps> = ({
  options,
  selectedValue,
  onSelect,
  placeholder = 'İkon Seçiniz',
  disabled = false,
  style,
}) => {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [listGeom, setListGeom] = useState({ top: 0, left: SIDE_MARGIN, width: 200, height: 0 });

  const btnRef = useRef<RNView>(null);

  const selectedOption = options.find(o => o.value === selectedValue);

  const computeListGeometry = (btn: { top: number; left: number; width: number; height: number }) => {
    const idealHeight = Math.min(
      MAX_LIST_HEIGHT,
      Math.max(ITEM_HEIGHT * Math.min(options.length, 5), ITEM_HEIGHT * 3)
    );

    const spaceBelow = SCREEN.height - (btn.top + btn.height);
    const spaceAbove = btn.top;

    let height = idealHeight;
    let top: number;

    if (spaceBelow >= idealHeight) {
      top = btn.top + btn.height + 6;
    } else if (spaceAbove >= idealHeight) {
      top = btn.top - idealHeight - 6;
    } else {
      if (spaceBelow >= spaceAbove) {
        height = Math.max(Math.min(idealHeight, spaceBelow - 10), ITEM_HEIGHT * 3);
        top = btn.top + btn.height + 6;
      } else {
        height = Math.max(Math.min(idealHeight, spaceAbove - 10), ITEM_HEIGHT * 3);
        top = btn.top - height - 6;
      }
    }

    const width = Math.max(btn.width, 280); // İkon dropdown için daha geniş
    const maxLeft = SCREEN.width - width - SIDE_MARGIN;
    const clampedLeft = Math.max(SIDE_MARGIN, Math.min(btn.left, maxLeft));

    return { top, left: clampedLeft, width, height };
  };

  const measureButton = () => {
    if (!btnRef.current) return;
    (btnRef.current as any).measureInWindow((x: number, y: number, w: number, h: number) => {
      const geom = computeListGeometry({ top: y, left: x, width: w, height: h });
      setListGeom(geom);
    });
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) measureButton();
    setIsOpen(s => !s);
  };

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  const renderOption = ({ item }: { item: IconOption }) => {
    const isSelected = item.value === selectedValue;
    return (
      <TouchableOpacity
        variant="transparent"
        style={[
          styles.optionItem,
          {
            borderBottomColor: colors.border,
            backgroundColor: isSelected ? withAlpha(colors.primary, 0.14) : 'transparent',
          },
        ] as any}
        onPress={() => handleSelect(item.value)}
      >
        <Text style={styles.optionEmoji}>{item.emoji}</Text>
        <View style={styles.optionTextContainer}>
          <Text
            variant={isSelected ? 'accent' : 'primary'}
            size="medium"
            weight={isSelected ? 'semibold' : 'normal'}
          >
            {item.name}
          </Text>
        </View>
        {isSelected && <Text variant="accent" size="medium" weight="bold">✓</Text>}
      </TouchableOpacity>
    );
  };

  const buttonStyle = useMemo(
    () => [
      styles.dropdownButton,
      {
        backgroundColor: colors.card,
        borderColor: colors.border,
      },
    ],
    [colors]
  );

  return (
    <View variant="transparent" style={[styles.container, style] as any}>
      <TouchableOpacity
        ref={btnRef as any}
        variant="transparent"
        style={buttonStyle as any}
        onPress={handleToggle}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <View style={styles.selectedContent}>
          {selectedOption ? (
            <>
              <Text style={styles.selectedEmoji}>{selectedOption.emoji}</Text>
              <Text variant="primary" size="medium" weight="medium">
                {selectedOption.name}
              </Text>
            </>
          ) : (
            <Text variant="secondary" size="medium">{placeholder}</Text>
          )}
        </View>
        <Text variant="secondary" size="small">{isOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={[styles.modalOverlay, { backgroundColor: withAlpha(colors.text, 0.45) }]}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View
            style={[
              styles.dropdownList,
              {
                top: listGeom.top,
                left: listGeom.left,
                width: listGeom.width,
                maxHeight: listGeom.height,
                backgroundColor: colors.card,
                borderColor: colors.border,
                shadowColor: colors.text,
              },
            ] as any}
          >
            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              style={styles.optionsList}
              getItemLayout={(_d, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'relative' },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
  },
  selectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  selectedEmoji: {
    fontSize: 24,
  },
  modalOverlay: { flex: 1 },
  dropdownList: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 1,
    elevation: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  optionsList: { maxHeight: MAX_LIST_HEIGHT },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    minHeight: ITEM_HEIGHT,
    gap: 12,
  },
  optionEmoji: {
    fontSize: 24,
  },
  optionTextContainer: { flex: 1 },
});

export default IconDropdown;
