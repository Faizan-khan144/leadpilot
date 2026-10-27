import { useApi } from './useApi'

export const useMembers = () => {
  const { data, loading } = useApi('/members/assignable')
  return { members: data?.members || [], loading }
}
