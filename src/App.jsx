import { Fragment, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

import AnimatedRoutes from './AnimatedRoutes'


function App() {
  return (
    <Fragment>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </Fragment>
  )
}

export default App