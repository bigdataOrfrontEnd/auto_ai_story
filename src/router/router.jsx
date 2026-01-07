import App from '../App.jsx';
import { createHashRouter } from "react-router-dom";
const router = createHashRouter([
    {
        path: "/",
        element: <App />,
        // children: [
        //     {
        //         path: "/",
        //         index: true,
        //         element: <Dashboard />,
        //     },{
        //         path: "/system",
        //         element: <SystemConfig />,
        //         children: [
        //             {
        //                 path: "/system/user",
        //                 element: <User />,
        //             }
        //         ]
        //     },{
        //         path: "/alarm",
        //         element: <Alarm />,
        //     },{
        //         path: "/history",
        //         element: <History />,
        //     }
        // ]
    },
]);
export default router;