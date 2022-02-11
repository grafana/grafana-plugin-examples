package models

type QueryModel struct {
	RawQuery      string `json:"rawQuery"`
	RunnableQuery string `json:"-"`
}
