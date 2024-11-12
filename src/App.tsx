import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Workspace } from './pages/Workspace';
import { MyAccount } from './pages/MyAccount'; // Assurez-vous que le chemin est correct
import { Login } from './pages/Login'; // Assurez-vous que le chemin est correct
import { SignupFlow } from './pages/SignupFlow';
import { SignupLevel1 } from './pages/SignupFlow/SignupLevel1';
import { SignupLevel2 } from './pages/SignupFlow/SignupLevel2';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/workspace" element={<Workspace />} />
        <Route path="/myaccount" element={<MyAccount username="user123" profileImage="image.png" onBack={() => {}} onSave={() => {}} />} />
        <Route path="/login" element={<Login onLogin={() => {}} />} />
        <Route path="/signup" element={<SignupFlow onBack={() => {}} onComplete={() => {}} />} />
        <Route path="/signup/level1" element={<SignupLevel1 onNext={() => {}} onBack={() => {}} />} />
        <Route path="/signup/level2" element={<SignupLevel2 onComplete={() => {}} onBack={() => {}} />} />
      </Routes>
    </Router>
  );
}

export default App;