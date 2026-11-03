import { useState } from 'react';
import type { ReactNode } from 'react';
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
  const [expandedSkillId, setExpandedSkillId] = useState<number | null>(null);
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
      'Palauta oletustaidot?',
      'Kaikki nykyiset taidot poistetaan ja tilalle luodaan oletuspolku Koulu → Matikka → Kertolaskut.',
      [
        { text: 'Peruuta', style: 'cancel' },
        {
          text: 'Palauta',
          style: 'destructive',
          onPress: () => {
            void onResetSkills().then((saved) => {
              if (saved) {
                setExpandedSkillId(null);
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

  function renderSkill(skill: Skill, depth: number): ReactNode {
    const children = skills.filter((item) => item.parentId === skill.id);
    const expanded = expandedSkillId === skill.id;

    return (
      <View key={skill.id} style={depth > 0 ? styles.branch : undefined}>
        <View style={styles.skillNode}>
          <Pressable
            style={[styles.skillBubble, expanded && styles.expandedSkillBubble]}
            onPress={() =>
              setExpandedSkillId((current) => current === skill.id ? null : skill.id)
            }
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            accessibilityLabel={`${skill.name}, ${expanded ? 'sulje' : 'avaa'} taidon tiedot`}
          >
            <Text style={[styles.skillName, expanded && styles.expandedSkillName]}>
              {skill.name}
            </Text>
            {expanded ? (
              <ScrollView
                style={styles.skillNotesScroll}
                contentContainerStyle={styles.skillNotesContent}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.skillNotes}>
                  {skill.notes || 'Ei vielä muistiinpanoja.'}
                </Text>
              </ScrollView>
            ) : (
              <Text style={styles.tapHint}>NAPAUTA</Text>
            )}
          </Pressable>
          {expanded && (
            <Pressable
              style={styles.addChildButton}
              onPress={() => openForm(skill.id)}
              accessibilityRole="button"
            >
              <Text style={styles.addChildText}>+ Lisää jatkotaito</Text>
            </Pressable>
          )}
        </View>
        {children.map((child) => renderSkill(child, depth + 1))}
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
        <Text style={styles.resetButtonText}>Tyhjennä ja palauta oletustaidot</Text>
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
  skillNode: {
    alignItems: 'center',
    marginBottom: 10,
  },
  skillBubble: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.accent,
    borderWidth: 1,
    padding: 10,
  },
  skillName: {
    color: COLORS.text,
    fontSize: 12,
    textAlign: 'center',
  },
  expandedSkillBubble: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: COLORS.raised,
    padding: 14,
  },
  expandedSkillName: {
    color: COLORS.accent,
    fontSize: 14,
    marginBottom: 6,
  },
  skillNotesScroll: {
    flexGrow: 0,
    maxHeight: 100,
    width: '100%',
  },
  skillNotesContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  skillNotes: {
    color: COLORS.text,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
  tapHint: {
    color: COLORS.muted,
    fontSize: 9,
    marginTop: 4,
  },
  addChildButton: {
    marginTop: 2,
    paddingVertical: 4,
  },
  addChildText: {
    color: COLORS.accent,
    fontSize: 12,
  },
  branch: {
    marginLeft: 12,
    paddingLeft: 12,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 13,
  },
});
