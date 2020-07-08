import { blankSpace } from '../../helpers/filters'

//(state, spaceId)
export const getFilters = ({ filters }, spaceId)=>
    (
        filters.spaces[spaceId] ? filters.spaces[spaceId] : blankSpace
    ).items