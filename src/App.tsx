import { MotionConfig } from 'framer-motion';
import { RouterProvider } from 'react-router-dom';
import './App.css';
import { router } from './routes';

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <RouterProvider router={router} />
    </MotionConfig>
  );
}

export default App;
