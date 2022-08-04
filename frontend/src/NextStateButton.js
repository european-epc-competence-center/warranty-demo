import Button from 'react-bootstrap/Button'
import axios from 'axios'
import {BACKEND_URL} from './Config'

const NextStateButton = props => {
    function setDemoStateAtBackend() {
      axios.post(BACKEND_URL + '/api/setDemoState', null, {
        params: { nextState: props.nextState, demo_user_id: props.demoUserID }
      })
    }
  
    return (
      <Button variant='secondary' onClick={setDemoStateAtBackend}>
        {props.label}
      </Button>
    )
  }


  export default NextStateButton