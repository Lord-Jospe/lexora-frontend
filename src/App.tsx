import  router  from "./routes/AppRouter"
import { RouterProvider } from 'react-router-dom';
import './css/app.css'

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
