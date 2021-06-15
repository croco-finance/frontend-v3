import { useColor } from 'hooks/useColor'
import { PageWrapper, ThemedBackground } from 'pages/styled'
import React, { useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'

const Dashboard = ({
  match: {
    params: { address },
  },
}: RouteComponentProps<{ address: string }>) => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // theming
  const backgroundColor = useColor(address)

  return (
    <PageWrapper>
      <ThemedBackground backgroundColor={backgroundColor} />
      <div>DASHBOARD</div>
    </PageWrapper>
  )
}

export default Dashboard
