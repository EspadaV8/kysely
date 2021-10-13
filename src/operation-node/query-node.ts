import { InsertQueryNode } from './insert-query-node.js'
import { SelectQueryNode } from './select-query-node.js'
import { UpdateQueryNode } from './update-query-node.js'
import { DeleteQueryNode } from './delete-query-node.js'
import { WhereNode, WhereChildNode } from './where-node.js'
import { freeze } from '../util/object-utils.js'
import { JoinNode } from './join-node.js'
import { SelectionNode } from './selection-node.js'
import { ReturningNode } from './returning-node.js'
import { OperationNode } from './operation-node.js'

export type QueryNode =
  | SelectQueryNode
  | DeleteQueryNode
  | InsertQueryNode
  | UpdateQueryNode

export type MutatingQueryNode =
  | DeleteQueryNode
  | InsertQueryNode
  | UpdateQueryNode

export type FilterableQueryNode =
  | SelectQueryNode
  | DeleteQueryNode
  | UpdateQueryNode

/**
 * @internal
 */
export const QueryNode = freeze({
  is(node: OperationNode): node is QueryNode {
    return (
      DeleteQueryNode.is(node) ||
      InsertQueryNode.is(node) ||
      UpdateQueryNode.is(node) ||
      SelectQueryNode.is(node)
    )
  },

  isMutating(node: OperationNode): node is MutatingQueryNode {
    return (
      DeleteQueryNode.is(node) ||
      InsertQueryNode.is(node) ||
      UpdateQueryNode.is(node)
    )
  },

  isFilterable(node: OperationNode): node is FilterableQueryNode {
    return (
      SelectQueryNode.is(node) ||
      DeleteQueryNode.is(node) ||
      UpdateQueryNode.is(node)
    )
  },

  cloneWithWhere<T extends FilterableQueryNode>(
    node: T,
    op: 'and' | 'or',
    filter: WhereChildNode
  ): T {
    return freeze({
      ...node,
      where: node.where
        ? WhereNode.cloneWithFilter(node.where, op, filter)
        : WhereNode.create(filter),
    })
  },

  cloneWithJoin<T extends FilterableQueryNode>(node: T, join: JoinNode): T {
    return freeze({
      ...node,
      joins: node.joins ? freeze([...node.joins, join]) : freeze([join]),
    })
  },

  cloneWithReturning<T extends MutatingQueryNode>(
    node: T,
    selections: ReadonlyArray<SelectionNode>
  ): T {
    return freeze({
      ...node,
      returning: node.returning
        ? ReturningNode.cloneWithSelections(node.returning, selections)
        : ReturningNode.create(selections),
    })
  },
})