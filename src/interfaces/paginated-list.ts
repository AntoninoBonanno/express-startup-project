export default interface IPaginatedList<T> {
    pageSize: number,
    currentPage: number,
    totalPages: number,
    contentList: Array<T>
}
