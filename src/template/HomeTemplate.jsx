//react
import {Suspense} from 'react'

//components

import { SkeletonHome } from '../components/skeleton/SkeletonHome'
import { useScrollTop } from '../hooks/useScrollTop'
import { Outlet } from 'react-router-dom'

export default function HomeTemplate(){
    useScrollTop()
    return (
        <div>
            <Suspense fallback={<SkeletonHome/>}>
                <Outlet></Outlet>
            </Suspense>
        </div>
    )
}