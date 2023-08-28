import { css } from '@emotion/react'
import { Paper, Stack, styled } from '@mui/material'
import { Outlet, Link } from '@tanstack/react-router'

const Item = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  textAlign: 'center',
  margin: theme.spacing(1),
  color: theme.palette.text.secondary,
}))

export function Root() {
  return (
    <div
      css={css`
        display: flex;
        height: 100vh;
      `}
    >
      <div
        css={css`
          display: flex;
          flex-direction: column;
          width: 200px;
          height: 100%;
        `}
      >
        <Stack>
          <Item>
            <Link to="/">Home</Link>
          </Item>
          <Item>
            <Link to="/about">About</Link>
          </Item>
        </Stack>
      </div>
      <div
        css={css`
          flex: 1;
        `}
      >
        <Outlet />
      </div>
    </div>
  )
}
