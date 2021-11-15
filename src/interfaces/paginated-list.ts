export default interface IPaginatedList<T> {
    pageSize: number,
    currentPage: number,
    totalPages: number,
    totalItems: number,
    contentList: Array<T>
}