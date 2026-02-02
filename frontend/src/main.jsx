import { createRoot } from 'react-dom/client'
import { ProductsProvider } from "./store/ProductsContext";
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <ProductsProvider>
    <App />
  </ProductsProvider>,
)
