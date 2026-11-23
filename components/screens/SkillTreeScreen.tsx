import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Skill, NewSkill } from '../storage/skillRepository';
import { COLORS } from '../theme/theme';

type Props = {
  skills: Skill[];
  onCreateSkill: (skill: NewSkill) => Promise<boolean>;
  onResetSkills: () => Promise<boolean>;
};

export default function SkillTreeScreen({
  skills,
  onCreateSkill,
  onResetSkills,
}: Props) {
  const [formVisible, setFormVisible] = useState(false);
  const [parentId, setParentId] = useState<number | null>(null);
  const [expandedSkillIds, setExpandedSkillIds] = useState<number[]>([]);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');

  function openForm(selectedParentId: number | null) {
    setParentId(selectedParentId);
    setFormVisible(true);
  }

  async function submitSkill() {
    const skillName = name.trim();
    if (!skillName) return;

    const saved = await onCreateSkill({
      parentId,
      name: skillName,
      notes: notes.trim(),
    });

    if (saved) {
      setName('');
      setNotes('');
      setFormVisible(false);
    }
  }

  function confirmReset() {
    Alert.alert(
      'Tyhjennä taitopuu?',
      'Kaikki tämän käyttäjän taidot poistetaan.',
      [
        { text: 'Peruuta', style: 'cancel' },
        {
          text: 'Palauta',
          style: 'destructive',
          onPress: () => {
            void onResetSkills().then((saved) => {
              if (saved) {
                setExpandedSkillIds([]);
                setFormVisible(false);
                setName('');
                setNotes('');
              }
            });
          },
        },
      ],
    );
  }

  function toggleExpanded(skillId: number) {
    setExpandedSkillIds((current) =>
      current.includes(skillId)
        ? current.filter((id) => id !== skillId)
        : [...current, skillId],
    );
  }

  function renderSkill(skill: Skill, depth: number) {
    const children = skills.filter((item) => item.parentId === skill.id);
    const expanded = expandedSkillIds.includes(skill.id);

    return (
      <View key={skill.id} style={[styles.skillBranch, depth > 0 && styles.nestedBranch]}>
        <View style={[styles.skillRow, expanded && styles.expandedSkillRow]}>
          <Pressable
            style={styles.skillHeader}
            onPress={() => toggleExpanded(skill.id)}
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            accessibilityLabel={`${skill.name}, ${expanded ? 'sulje' : 'avaa'} taitovaihtoehdot`}
          >
            <View style={[styles.depthMarker, { marginLeft: depth * 8 }]} />
            <View style={styles.skillHeaderText}>
              <Text style={styles.skillName}>{skill.name}</Text>
              {children.length > 0 && (
                <Text style={styles.childCount}>{children.length} alataitoa</Text>
              )}
            </View>
            <Text style={[styles.chevron, expanded && styles.chevronExpanded]}>
              {expanded ? '⌃' : '⌄'}
            </Text>
          </Pressable>

          {expanded && (
            <View style={styles.skillDetails}>
              <Text style={styles.skillNotesLabel}>MUISTIINPANOT</Text>
              <Text style={styles.skillNotes}>
                {skill.notes || 'Ei vielä muistiinpanoja.'}
              </Text>
              {children.length > 0 && (
                <View style={styles.submenuList}>
                  {children.map((child) => renderSkill(child, depth + 1))}
                </View>
              )}
              <Pressable
                style={styles.addChildButton}
                onPress={() => openForm(skill.id)}
                accessibilityRole="button"
              >
                <Text style={styles.addChildText}>+ Lisää alataito</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    );
  }

  const roots = skills.filter((skill) => skill.parentId === null);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.heading}>
        <Text style={styles.title}>Taitopuu</Text>
        <Pressable
          style={styles.addRootButton}
          onPress={() => openForm(null)}
          accessibilityRole="button"
        >
          <Text style={styles.addRootText}>+ Lisää</Text>
        </Pressable>
      </View>
      <Pressable
        style={styles.resetButton}
        onPress={confirmReset}
        accessibilityRole="button"
      >
        <Text style={styles.resetButtonText}>Tyhjennä taitopuu</Text>
      </Pressable>

      {formVisible && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>Uusi taito</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Taidon nimi"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
            maxLength={80}
            accessibilityLabel="Taidon nimi"
          />
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Muistiinpanot"
            placeholderTextColor={COLORS.muted}
            style={[styles.input, styles.notesInput]}
            multiline
            maxLength={500}
            accessibilityLabel="Taidon muistiinpanot"
          />
          <Text style={styles.fieldLabel}>Liitä tähän:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.parentOptions}
          >
            <ParentOption
              label="Juuritaito"
              selected={parentId === null}
              onPress={() => setParentId(null)}
            />
            {skills.map((skill) => (
              <ParentOption
                key={skill.id}
                label={skill.name}
                selected={parentId === skill.id}
                onPress={() => setParentId(skill.id)}
              />
            ))}
          </ScrollView>
          <View style={styles.formActions}>
            <Pressable
              style={styles.cancelButton}
              onPress={() => setFormVisible(false)}
              accessibilityRole="button"
            >
              <Text style={styles.cancelText}>Peruuta</Text>
            </Pressable>
            <Pressable
              style={[styles.saveButton, !name.trim() && styles.disabledButton]}
              onPress={() => void submitSkill()}
              disabled={!name.trim()}
              accessibilityRole="button"
            >
              <Text style={styles.saveText}>Tallenna taito</Text>
            </Pressable>
          </View>
        </View>
      )}

      {roots.length > 0 ? (
        roots.map((skill) => renderSkill(skill, 0))
      ) : (
        <Text style={styles.emptyText}>Taitoja ei vielä ole. Lisää ensimmäinen.</Text>
      )}
    </ScrollView>
  );
}

function ParentOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.parentOption, selected && styles.selectedParentOption]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.parentOptionText, selected && styles.selectedParentText]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
  },
  addRootButton: {
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addRootText: {
    color: COLORS.accent,
    fontSize: 13,
  },
  resetButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    marginBottom: 12,
  },
  resetButtonText: {
    color: COLORS.muted,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  form: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    marginBottom: 16,
  },
  formTitle: {
    color: COLORS.text,
    fontSize: 15,
    marginBottom: 8,
  },
  fieldLabel: {
    color: COLORS.text,
    fontSize: 12,
    marginBottom: 5,
  },
  input: {
    color: COLORS.text,
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    fontSize: 14,
    padding: 8,
    marginBottom: 8,
  },
  notesInput: {
    minHeight: 54,
    textAlignVertical: 'top',
  },
  parentOptions: {
    gap: 5,
    paddingBottom: 2,
  },
  parentOption: {
    borderColor: COLORS.border,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  selectedParentOption: {
    backgroundColor: COLORS.accent,
  },
  parentOptionText: {
    color: COLORS.text,
    fontSize: 12,
  },
  selectedParentText: {
    color: COLORS.background,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  cancelButton: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  cancelText: {
    color: COLORS.text,
    fontSize: 13,
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  disabledButton: {
    opacity: 0.45,
  },
  saveText: {
    color: COLORS.background,
    fontSize: 13,
    fontWeight: '700',
  },
  skillBranch: {
    marginBottom: 8,
  },
  nestedBranch: {
    marginLeft: 8,
  },
  skillRow: {
    overflow: 'hidden',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  expandedSkillRow: {
    borderColor: '#2E7468',
  },
  skillHeader: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  depthMarker: {
    width: 3,
    height: 28,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
    marginRight: 10,
  },
  skillHeaderText: {
    flex: 1,
  },
  skillName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  childCount: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },
  chevron: {
    color: COLORS.accent,
    fontSize: 20,
    width: 24,
    textAlign: 'center',
  },
  chevronExpanded: {
    color: COLORS.text,
  },
  skillDetails: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.raised,
    paddingHorizontal: 12,
    paddingTop: 11,
    paddingBottom: 8,
  },
  skillNotesLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  skillNotes: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  submenuList: {
    marginTop: 10,
  },
  addChildButton: {
    alignSelf: 'flex-start',
    marginTop: 9,
    paddingVertical: 7,
  },
  addChildText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 13,
  },
});
