import  router  from "./routes/AppRouter"
import { RouterProvider }
from 'react-router-dom';
import './css/app.css'

import { Toaster } from 'sonner';


function App() {
  return (
    <>
      <Toaster
        richColors
        position="top-right"
      />
      <RouterProvider router={router} />
    </>
  )
}

export default App
