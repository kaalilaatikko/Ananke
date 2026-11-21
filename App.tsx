import { useState } from 'react';
import AppLayout from './components/layout/AppLayout';
import type { AppPage } from './components/layout/AppLayout';
import DiaryScreen from './components/screens/DiaryScreen';
import MainMenuScreen from './components/screens/MainMenuScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import SignInScreen from './components/screens/SignInScreen';
import SkillTreeScreen from './components/screens/SkillTreeScreen';
import { useAppController } from './components/hooks/useAppController';

export default function App() {
  const [page, setPage] = useState<AppPage>('home');
  const app = useAppController();

  if (app.authReady && !app.databaseReady) {
    return <SignInScreen error={app.storageError} onSignIn={app.signIn} />;
  }

  return (
    <AppLayout
      today={app.today}
      activePage={page}
      databaseReady={app.databaseReady}
      storageError={app.storageError}
      onPageChange={setPage}
      onRetryDatabase={app.retryDatabase}
    >
      {app.databaseReady && (
        <>
          {page === 'home' && (
            <MainMenuScreen
              today={app.today}
              tasks={app.tasks.dailyTasks}
              availableTemplates={app.tasks.availableTemplates}
              taskInput={app.tasks.taskInput}
              onTaskInputChange={app.tasks.setTaskInput}
              onAddTask={app.tasks.addTask}
              onAddTemplateTask={app.tasks.addTemplateTask}
              onToggleTask={(id) => {
                void app.tasks.toggleTask(id).then(app.refreshProfile);
              }}
              onOpenDiary={() => setPage('diary')}
            />
          )}
          {page === 'diary' && (
            <DiaryScreen
              entries={app.diary.entries}
              selectedDate={app.diary.selectedDate}
              visibleMonth={app.diary.visibleMonth}
              onChangeMonth={app.diary.changeMonth}
              onSelectDate={app.diary.setSelectedDate}
              onUpdateEntry={app.diary.updateEntry}
            />
          )}
          {page === 'profile' && <ProfileScreen data={app.profile} />}
          {page === 'skills' && (
            <SkillTreeScreen
              skills={app.skillTree.skills}
              onCreateSkill={app.skillTree.addSkill}
              onResetSkills={app.skillTree.resetSkills}
            />
          )}
        </>
      )}
    </AppLayout>
  );
}
